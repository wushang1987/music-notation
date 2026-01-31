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

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are an expert music composer and arranger specializing in ABC notation. Create complex, professional-grade musical arrangements. Output ONLY the valid ABC notation code. No markdown, no explanations. Start with X:1" },
                    {
                        role: "user", content: `Compose a complete musical arrangement based on this description: "${prompt}".
                    
                    Requirements:
                    1. Structure: The piece MUST follow a complete song structure: Intro -> Verse -> Pre-Chorus -> Chorus -> Bridge -> Chorus -> Outro.
                    2. Duration: Unless specified otherwise in the description, the piece should be approximately 3 minutes long (ensure enough bars and repeats).
                    3. Instrumentation: Use multiple instruments/voices (at least 2-3 parts, e.g., Melody, Harmony, Bass) using V:1, V:2, etc.
                    4. Format: Return ONLY valid ABC notation starting with X:1. Include T:Title, C:Composer (AI), M:Meter, L:Unit Note Length, K:Key, and Q:Tempo fields.` }
                ],
                stream: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('DeepSeek API Error:', data);
            throw new Error(data.error?.message || 'Failed to generate music');
        }

        let abcContent = data.choices[0].message.content;

        // Cleanup markdown code blocks if present
        abcContent = abcContent.replace(/```abc/gi, '').replace(/```/g, '').trim();

        res.json({ abc: abcContent });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate music' });
    }
};

module.exports = { generateMusic };
