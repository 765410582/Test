
const win = window as any;

export const languages = {
    loading:"loading",
    
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
