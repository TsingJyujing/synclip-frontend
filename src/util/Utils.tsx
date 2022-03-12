export function* Counter(n: number) {
    for (let i = 0; i < n; i++) {
        yield i
    }
}

export function convertDateToLocal(utcDate: string) {
    // TODO format it better with relative duration
    return new Date(utcDate).toLocaleString();
}