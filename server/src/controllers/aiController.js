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
                    { role: "system", content: "You are a helpful assistant that generates ABC music notation. Output ONLY the ABC notation code. No markdown, no explanations. Start with X:1" },
                    { role: "user", content: `Generate a piece of music based on this description: ${prompt}. Return valid ABC notation. Ensure it starts with X:1 and has a T:Title field.` }
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
