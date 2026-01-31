const generateMusic = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error('DEEPSEEK_API_KEY is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-reasoner",
                messages: [
                    { role: "system", content: "You are an expert music composer and arranger specializing in ABC notation. Create complex, professional-grade musical arrangements. Output ONLY the valid ABC notation code after your reasoning. Start the ABC notation with X:1" },
                    {
                        role: "user", content: `Compose a complete musical arrangement based on this description: "${prompt}".
                    
Requirements:
1. Structure: The piece MUST follow a complete song structure: Intro -> Verse -> Pre-Chorus -> Chorus -> Bridge -> Chorus -> Outro.
2. Duration: Unless specified otherwise in the description, the piece should be approximately 3 minutes long (ensure enough bars and repeats).
3. Instrumentation: Use multiple instruments/voices (at least 2-3 parts, e.g., Melody, Harmony, Bass) using V:1, V:2, etc. IMPORTANT: You MUST specify the MIDI instrument for each voice using '%%MIDI program [program_number]' immediately after each voice definition or in the header. Choose appropriate General MIDI program numbers (e.g., 0 for Piano, 40 for Violin, 73 for Flute, 24 for Acoustic Guitar, 32 for Acoustic Bass) that match the intended instrument.
4. Format: Return ONLY valid ABC notation starting with X:1. Include T:Title, C:Composer (AI), M:Meter, L:Unit Note Length, K:Key, and Q:Tempo fields.` }
                ],
                stream: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('DeepSeek API Error:', errorData);
            res.write(`data: ${JSON.stringify({ error: errorData.error?.message || 'Failed to generate music' })}\n\n`);
            return res.end();
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.replace('data: ', ''));
                        const delta = json.choices[0].delta;

                        // Send reasoning if present
                        if (delta.reasoning_content) {
                            res.write(`data: ${JSON.stringify({ reasoning: delta.reasoning_content })}\n\n`);
                        }

                        // Send content (ABC) if present
                        if (delta.content) {
                            res.write(`data: ${JSON.stringify({ abc: delta.content })}\n\n`);
                        }
                    } catch (e) {
                        // Ignore parse errors for partial chunks
                    }
                }
            }
        }

        res.end();

    } catch (error) {
        console.error('AI Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Failed to generate music' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
            res.end();
        }
    }
};

module.exports = { generateMusic };
