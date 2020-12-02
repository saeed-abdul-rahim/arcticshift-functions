export function callerName() {
    const stack = new Error().stack,
    caller = stack?.split('\n')[2].trim();
    return caller || ''
}
