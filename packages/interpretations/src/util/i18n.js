// Temporal functions until d2-i18n support datetime localization

export function formatDate(s) {
    const date = new Date(s);
    return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join("/");
}

export function formatRelative(s) {
    const date = new Date(s);
    return [formatDate(s), date.getHours() + ":" + date.getMinutes()].join(" ");
}