function sleep(ms, reason = '') {
    const safeMs = Math.max(0, Math.min(ms, 2147483647)); // Max 32-bit signed int
    return new Promise(resolve => {
      const timer = setTimeout(resolve, safeMs);
      // Don't block process exit
      if (timer.unref) timer.unref();
    });
  }
  
  module.exports = sleep;