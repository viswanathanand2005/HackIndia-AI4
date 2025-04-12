require('dotenv').config();
const AI_CONFIG = require('./aiConfig');
const sleep = require('./sleep');

// Cache with TTL (Time-To-Live) implementation
const cache = new Map();
let cacheStats = { hits: 0, misses: 0 };

// Queue system for rate limiting
const requestQueue = [];
const activeRequests = new Map();

// Statistics tracking
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  fallbacksUsed: 0
};

// Basic enhancement fallback
const basicEnhancement = (description = '') => {
  if (typeof description !== 'string') description = String(description);
  return description.trim().charAt(0).toUpperCase() + 
         description.trim().slice(1) + 
         (description.trim().endsWith('.') ? '' : '.') + 
         " Professional service with quality guarantee.";
};

// Process items from the queue
const processQueue = async () => {
  try {
    if (requestQueue.length === 0 || 
        activeRequests.size >= AI_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
      return;
    }

    const queueItem = requestQueue.shift();
    if (!queueItem) return;

    const { description, requestId, resolve, reject } = queueItem;
    
    try {
      activeRequests.set(requestId, { status: 'processing', description });
      
      // Simulate API call (replace with actual API call)
      await sleep(300);
      const enhancedText = `Professional ${description} service with guaranteed quality and timely delivery.`;
      
      stats.successfulRequests++;
      resolve({
        enhanced: enhancedText,
        isFallback: false,
        fromCache: false
      });
    } catch (error) {
      stats.failedRequests++;
      reject(error);
    } finally {
      activeRequests.delete(requestId);
      setTimeout(processQueue, AI_CONFIG.RATE_LIMIT.DELAY_MS);
    }
  } catch (error) {
    console.error('Queue processing error:', error);
  }
};

// Main enhancement function
const enhanceDescription = async (description, retries = AI_CONFIG.RATE_LIMIT.MAX_RETRIES) => {
  // Input validation
  if (typeof description !== 'string') {
    stats.fallbacksUsed++;
    return { 
      enhanced: basicEnhancement(description), 
      isFallback: true,
      fromCache: false
    };
  }

  description = description.trim();
  stats.totalRequests++;
  const cacheKey = `desc:${description.toLowerCase()}`;

  // Check cache first
  if (cache.has(cacheKey)) {
    stats.cacheHits++;
    return { ...cache.get(cacheKey), fromCache: true };
  }

  stats.cacheMisses++;

  try {
    const result = await new Promise((resolve, reject) => {
      const requestId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const timer = setTimeout(() => {
        reject(new Error(`Timeout after ${AI_CONFIG.API.TIMEOUT_MS}ms`));
      }, AI_CONFIG.API.TIMEOUT_MS);

      requestQueue.push({
        timestamp: Date.now(),
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
        description,
        requestId
      });

      processQueue();
    });

    cache.set(cacheKey, { enhanced: result.enhanced, isFallback: false });
    return result;
  } catch (error) {
    console.error('Enhancement failed:', error.message);
    stats.fallbacksUsed++;
    const basic = basicEnhancement(description);
    return { enhanced: basic, isFallback: true };
  }
};

module.exports = { 
  enhanceDescription,
  getQueueStatus: () => ({
    queueLength: requestQueue.length,
    activeRequests: activeRequests.size,
    ...stats
  })
};