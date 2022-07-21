export function truncateString(str, max)
{
    if (str.length <= max) {
        return str;
    }

    return str.substr(0, max) + '...';
}
