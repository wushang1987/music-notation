const generateMusic = async (req, res) => {
    try {
        const { prompt, language = 'en' } = req.body;
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
                    {
                        role: "system",
                        content: language === 'zh'
                            ? "你是一位精通 ABC 记谱法的专业作曲家和编曲家。创作复杂、专业级的音乐编排。你的回复应包含两部分：推理过程（reasoning，如果使用推理模型）和最终的 ABC 记谱法。你必须确保最终响应字段（'content'）中只包含有效的 ABC 记谱法代码，不要有对话性的填充内容、推理过程或 markdown 代码块。ABC 记谱法必须直接以 X:1 开头。请用中文进行推理和解释，必要时可在技术术语后用括号标注英文原文。"
                            : "You are an expert music composer and arranger specializing in ABC notation. Create complex, professional-grade musical arrangements. Your response should consist of two parts: reasoning (if using a reasoning model) and the final ABC notation. You MUST ensure that the final response field (the 'answer' or 'content') contains ONLY the valid ABC notation code, with no conversational filler, no reasoning, and no markdown blocks. Start the ABC notation immediately with X:1"
                    },
                    {
                        role: "user",
                        content: language === 'zh'
                            ? `根据以下描述创作一首完整的音乐编曲："${prompt}"。
                    
要求：
1. 结构：乐曲必须遵循完整的歌曲结构：引子 -> 主歌 -> 预副歌 -> 副歌 -> 桥段 -> 副歌 -> 尾奏。
2. 时长：除非描述中另有说明，乐曲应约为 2 分钟长（确保有足够的小节和重复）。
3. 配器：使用多个乐器/声部（至少 2-3 个声部，例如：旋律、和声、贝斯），使用 V:1、V:2 等。重要提示：你必须为每个声部指定 MIDI 乐器，在每个声部定义后或在头部使用 '%%MIDI program [program_number]'。选择合适的通用 MIDI 程序编号（例如：0 代表钢琴、40 代表小提琴、73 代表长笛、24 代表原声吉他、32 代表原声贝斯）以匹配预期的乐器。
4. 格式：在 content 字段中只返回有效的 ABC 记谱法，以 X:1 开头。不要在 content 字段中包含任何推理或文字说明。`
                            : `Compose a complete musical arrangement based on this description: "${prompt}".
                    
Requirements:
1. Structure: The piece MUST follow a complete song structure: Intro -> Verse -> Pre-Chorus -> Chorus -> Bridge -> Chorus -> Outro.
2. Duration: Unless specified otherwise in the description, the piece should be approximately 3 minutes long (ensure enough bars and repeats).
3. Instrumentation: Use multiple instruments/voices (at least 2-3 parts, e.g., Melody, Harmony, Bass) using V:1, V:2, etc. IMPORTANT: You MUST specify the MIDI instrument for each voice using '%%MIDI program [program_number]' immediately after each voice definition or in the header. Choose appropriate General MIDI program numbers (e.g., 0 for Piano, 40 for Violin, 73 for Flute, 24 for Acoustic Guitar, 32 for Acoustic Bass) that match the intended instrument.
4. Format: Return ONLY valid ABC notation starting with X:1 in your content field. Do not include any reasoning or text explanation in the content field.`
                    }
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

const modifyMusic = async (req, res) => {
    try {
        const { prompt, currentAbc, language = 'en' } = req.body;
        if (!prompt || !currentAbc) {
            return res.status(400).json({ error: 'Prompt and currentAbc are required' });
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
                    {
                        role: "system",
                        content: language === 'zh'
                            ? "你是一位精通 ABC 记谱法的专业作曲家和编曲家。你的任务是根据用户的指示修改提供的 ABC 记谱法。除非用户要求，否则保持整体结构不变。你必须确保最终响应字段（'content'）中只包含有效的修改后的 ABC 记谱法代码，不要有对话性的填充内容、推理过程或 markdown 代码块。ABC 记谱法必须直接以 X:1 开头。请用中文进行推理和解释，必要时可在技术术语后用括号标注英文原文。"
                            : "You are an expert music composer and arranger specializing in ABC notation. Your task is to modify the provided ABC notation according to the user's instructions. Keep the overall structure unless requested otherwise. You MUST ensure that the final response field (the 'content') contains ONLY the valid modified ABC notation code, with no conversational filler, no reasoning, and no markdown blocks. Start the ABC notation immediately with X:1"
                    },
                    {
                        role: "user",
                        content: language === 'zh'
                            ? `当前 ABC 记谱法：\n${currentAbc}\n\n修改指令："${prompt}"。\n\n要求：\n1. 保持有效性和专业编排。\n2. 在 content 字段中只返回完整的修改后的 ABC 记谱法，以 X:1 开头。不要在 content 字段中包含任何推理或介绍性文字。`
                            : `Current ABC notation:\n${currentAbc}\n\nModification instruction: "${prompt}".\n\nRequirements:\n1. Maintain validity and professional arrangement.\n2. Return ONLY the complete modified ABC notation starting with X:1 in the content field. Do not include any reasoning or introductory text in the content field.`
                    }
                ],
                stream: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('DeepSeek API Error:', errorData);
            res.write(`data: ${JSON.stringify({ error: errorData.error?.message || 'Failed to modify music' })}\n\n`);
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

                        if (delta.reasoning_content) {
                            res.write(`data: ${JSON.stringify({ reasoning: delta.reasoning_content })}\n\n`);
                        }

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
        console.error('AI Modification Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Failed to modify music' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
            res.end();
        }
    }
};

module.exports = { generateMusic, modifyMusic };
