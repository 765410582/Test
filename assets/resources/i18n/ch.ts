
const win = window as any;

export const languages = {
    loading:"加载中",
    
};

if (!win.languages) {
    win.languages = {};
}

win.languages.ch = languages;
