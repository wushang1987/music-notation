
// Import raw content of the scripts
import abc2svgCode from './abc2svg-1.js?raw';
import jianpuCode from './jianpu-1.js?raw';

let abc2svgInstance = null;

export const getAbc2Svg = () => {
    if (abc2svgInstance) return abc2svgInstance;

    // Create a sandbox-like environment object
    const context = {
        abc2svg: {
            modules: {
                hooks: [],
                jianpu: {}
            }
        }
    };

    // Execute abc2svg-1.js
    // It expects 'abc2svg' to be present or it creates it.
    // The script starts with: if(typeof abc2svg=="undefined") var abc2svg={};
    // So if we define it, it uses it.
    try {
        // We use new Function to execute in local scope, but we need to expose 'abc2svg' to it.
        // Doing this via eval in the current scope is easiest for a quick vendor patch.
        // However, strict mode issues might arise.

        // Let's attach to the module scope variable.
        // Since the scripts use 'var abc2svg', we might need to rely on window or a context.
        // But 'abc2svg-1.js' writes to 'abc2svg' property.

        // Quickest way: append the code and return the object.
        const initCode = `
            var abc2svg = arguments[0];
            ${abc2svgCode}
            ${jianpuCode}
            return abc2svg;
        `;

        const factory = new Function(initCode);
        abc2svgInstance = factory(context.abc2svg);

        // Initialize modules if needed
        if (abc2svgInstance.modules && abc2svgInstance.modules.hooks) {
            abc2svgInstance.modules.hooks.forEach(hook => {
                if (typeof hook === 'function') {
                    // This is tricky: hooks usually attach methods to prototype.
                    // We might need an instance of Abc to run hooks on, OR correct the flow.
                    // jianpu-1.js pushes 'set_hooks' to abc2svg.modules.hooks
                }
            });
        }

    } catch (e) {
        console.error("Failed to initialize abc2svg", e);
    }

    return abc2svgInstance;
};

export const renderJianpu = (elementId, abcString) => {
    const lib = getAbc2Svg();
    if (!lib || !lib.Abc) {
        console.error("abc2svg implementation not found");
        return;
    }

    const container = document.getElementById(elementId);
    if (!container) return;

    // Clear container
    container.innerHTML = "";

    // Create a new instance
    // The user object is for handling output (img_out, errmsg, etc.)
    const user = {
        img_out: (str) => {
            container.innerHTML += str;
        },
        errmsg: (msg, l, c) => {
            console.warn("abc2svg warning:", msg, "Line:", l, "Col:", c);
        },
        read_file: (fn) => {
            console.log("read_file requested", fn);
            return "";
        },
        // We need to implement other callbacks if necessary
    };

    const abc = new lib.Abc(user);

    // Apply hooks (specifically Jianpu)
    if (lib.modules && lib.modules.hooks) {
        lib.modules.hooks.forEach(hook => hook(abc));
    }

    // Force Jianpu mode via internal setting or ABC injection
    // The manual says %%jianpu 1
    // Injection at the top of ABC seems safest.
    const modifiedAbc = "%%jianpu 1\n" + abcString;

    try {
        abc.tosvg("score", modifiedAbc);
    } catch (e) {
        console.error("Rendering error", e);
        container.innerHTML = `<div class="text-red-500">Rendering Error: ${e.message}</div>`;
    }
};
