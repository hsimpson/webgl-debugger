function syncWait(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) continue;
}

export { syncWait };
