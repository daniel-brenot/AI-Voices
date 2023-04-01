
/** Can create a wait time between events when used with the inner
 * limit function
 */
export class RateLimiter {

    private lastCalled?: number;

    constructor(private rate: number) {}

    /**
     * Awaiting this function will cause the call to wait if the last time
     * it was called was less than the rate time
     */
    async limit() {
        if(this.lastCalled) {
            let difference = Date.now() - this.lastCalled;
            if(difference < this.rate) {
                await sleep(this.rate - difference);
            }
        }
        // Set the current time as the new reference time
        this.lastCalled = Date.now();
    }
}

/** Can create a wait time between events when used with the inner
 * limit function.
 * 
 * This differs from the standard rate limiter by giving allowance when a request finishes soon
 * to allow for the best rate without going too fast
 */
export class RubberRateLimiter {

    private lastCalled?: number;

    /** Builds up if requests take a while */
    private allowance = 0;

    constructor(private rate: number) {}

    /**
     * Awaiting this function will cause the call to wait if the last time
     * it was called was less than the rate time
     */
    async limit() {
        if(this.lastCalled) {
            let difference = Date.now() - this.lastCalled;
            // If it finished later than the rate, save that difference
            if (difference > this.rate) { this.allowance += (difference - this.rate); }
            // Otherwise use up the difference
            else if ((difference + this.allowance) > this.rate) {
                this.allowance = (difference + this.allowance) - this.rate;
            // Lastly if not, use up allowance if there is any and sleep the remainder
            } else {
                difference = (difference + this.allowance);
                this.allowance = 0;
                await sleep(this.rate - difference);
            }
        }
        // Set the current time as the new reference time
        this.lastCalled = Date.now();
    }
}

export class BackoffHandler {

    /** The current amount of time that will be waited when backoff is called*/
    backoffTime: number;

    constructor(private baseTime: number, private backoffFactor: number) {
        this.backoffTime = baseTime;
    }

    async backoff(ticker: (elapsed: number) => void) {
        // Sleep in 1000ms increments so we can update the ui
        let backoffCount = this.backoffTime / 1000;
        for(let i = 0; i < backoffCount;i++) {
            await sleep(1000);
            ticker(i*1000);
        }
        // Multiply by the factor so that next time this is called it waits longer
        this.backoffTime *= this.backoffFactor;
    }

    /**
     * Should be called when the operation succeeds to reset how long
     * to wait next time
     */
    reset() {
        this.backoffTime = this.baseTime
    }
}

export async function sleep(duration: number) {
    return new Promise((res) =>setTimeout(res, duration));
}