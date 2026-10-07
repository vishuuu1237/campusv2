export function formatINR(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
}

export function calculateListingFee(price) {
    const p = parseFloat(price) || 0;
    if (p <= 0) return 0;
    if (p <= 100) return 5;
    if (p <= 500) return 10;
    if (p <= 1000) return 25;
    // Above 1000: 50rs base + 2rs for each 500rs above 1000rs
    const excess = p - 1000;
    const extraSlabs = Math.ceil(excess / 500);
    return 50 + extraSlabs * 2;
}
