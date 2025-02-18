import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Constants
const GAME_CONFIG = {
  REPLENISH_INTERVAL: 5 * 60 * 1000, // 10 minutes in milliseconds
  MAX_MOVES: 5,
  OFF_CHAIN_BALANCE_INTERVAL: 30 * 60 * 1000, // 30 minutes in milliseconds
  OFF_CHAIN_BALANCE_INCREMENT: 5,
  OFF_CHAIN_BALANCE_DEFAULT: 20
};


export const updateUserInventory = async (req, res) => {
    try {
      const { did } = req.params;
      
      if (!did) {
        return res.status(400).json({ error: 'DID parameter is required' });
      }
  
      // Add debug logging
      console.log('Updating inventory for DID:', did);
  
      // Get current user state
      const user = await getUserInventory(did);
      console.log('Retrieved user data:', user);

      const now = new Date().getTime();
  
      // Calculate new counts
      const newCounts = calculateNewCounts(user);
      console.log('New counts calculated:', newCounts);
  
      // Calculate new timers
      const newOffChainBalance = calculateNewOffChainBalance(user);
      console.log('New off-chain balance:', newOffChainBalance);

      // Log update payload
      const updatePayload = {
        rock_count: newCounts.rock,
        rock_count_last_update: adjustTimestamp(user.rock_count, 
                                              user.rock_count_last_update, 
                                              newCounts.rock, 
                                              now,
                                              'rock'),
        paper_count: newCounts.paper,
        paper_count_last_update: adjustTimestamp(user.paper_count, 
                                               user.paper_count_last_update, 
                                               newCounts.paper, 
                                               now,
                                               'paper'),
        scissors_count: newCounts.scissors,
        scissors_count_last_update: adjustTimestamp(user.scissors_count, 
                                                  user.scissors_count_last_update, 
                                                  newCounts.scissors, 
                                                  now,
                                                  'scissors'),
        off_chain_balance: newOffChainBalance,
        off_chain_balance_last_update: adjustTimestamp(user.off_chain_balance, 
                                                      user.off_chain_balance_last_update, 
                                                      newOffChainBalance, 
                                                      now,
                                                      'off_chain_balance')
      };
      console.log('Update payload:', updatePayload);

      // Update database
      await updateInventoryInDB(did, updatePayload);
  
      // Calculate next replenish times for response
      return res.status(200).json({
        // rock_count: newCounts.rock,
        // paper_count: newCounts.paper,
        // scissors_count: newCounts.scissors,
        // off_chain_balance: newOffChainBalance,
        success: true,
        next_replenish: {
          rock: calculateNextReplenishTime(newCounts.rock, updatePayload.rock_count_last_update),
          paper: calculateNextReplenishTime(newCounts.paper, updatePayload.paper_count_last_update),
          scissors: calculateNextReplenishTime(newCounts.scissors, updatePayload.scissors_count_last_update),
          off_chain_balance: calculateNextOffChainReplenishTime(newOffChainBalance, updatePayload.off_chain_balance_last_update)
        }
      });
  
    } catch (error) {
      // More detailed error logging
      console.error('Error updating inventory:', {
        message: error.message,
        stack: error.stack,
        did: req.params.did
      });
      const status = error.message === 'User not found' ? 404 : 500;
      const message = error.message === 'User not found' ? error.message : 'Internal server error';
      return res.status(status).json({ error: message });
    }
}; 
const calculateNewCounts = (user) => {
    const now = new Date().getTime();
    return {
        rock: calculateNewCount(user.rock_count, user.rock_count_last_update, now),
        paper: calculateNewCount(user.paper_count, user.paper_count_last_update, now),
        scissors: calculateNewCount(user.scissors_count, user.scissors_count_last_update, now)
    }
}
const calculateNewOffChainBalance = (user) => {
    const now = new Date().getTime();
    const lastUpdate = user.off_chain_balance_last_update;
    const offChainBalance = user.off_chain_balance;
    if (lastUpdate == null) return offChainBalance
    
    const elapsed = now - lastUpdate;

    if (offChainBalance == null) {
        return GAME_CONFIG.OFF_CHAIN_BALANCE_DEFAULT;
    } 
    else if (offChainBalance <= 0 && elapsed >= GAME_CONFIG.OFF_CHAIN_BALANCE_INTERVAL) {
        return GAME_CONFIG.OFF_CHAIN_BALANCE_INCREMENT;
    } 
    else { //if 0 and interval has passed
        return offChainBalance 
        
    }
}

  
// Helper functions
/**
 * Calculate the new count of a resource based on the time elapsed since the last update.
 * This function ensures that the count does not exceed the maximum allowed moves.
 * 
 * Example:
 * If the current count is 0 and the last update was 5 minutes ago, the new count will be 1
 * If the current count is 2 and the last update was 5 minutes ago, the new count will be 2
 * If the current count is 5 and the last update was 5 minutes ago, the new count will be 5
 * 
 * @param {number} currentCount - The current count of the resource.
 * @param {string} lastUpdate - The timestamp of the last update.
 * @param {Date} now - The current date and time.
 * @returns {number} - The updated count of the resource.
 */
const calculateNewCount = (currentCount, lastUpdate, now) => {
    // If there's no last update, return the current count as is
    var count = currentCount;
    if (count < 0) count = 0;
    if (!lastUpdate) return count;
    // Calculate the time elapsed since the last update
    const elapsed = now - new Date(lastUpdate);
    const intervals = Math.floor(elapsed / GAME_CONFIG.REPLENISH_INTERVAL);

    return Math.min(count + intervals, GAME_CONFIG.MAX_MOVES);
};




/**
 * Adjust the timestamp of the last update based on the new count and the current time.
 * This function ensures that the timestamp is not updated if the last update was before the replenish interval.
 * 
 * @param {number} currentCount - The current count of the resource.
 * @param {string} lastUpdate - The timestamp of the last update.
 * @param {number} newCount - The new count of the resource.
 * @param {Date} now - The current date and time.
 * @returns {number} - The updated timestamp of the last update in milliseconds since 1970s
 */
const adjustTimestamp = (currentCount, lastUpdate, newCount, now, item) => {
  console.log('Adjusting timestamp:', { currentCount, lastUpdate, newCount, now, item });
  if (lastUpdate == null) return now;
  const currentTime = now
  // Only update timestamp if:
  // 1. This is the first update (lastUpdate is null)
  // 2. The resource count actually increased AND enough time passed
  if (newCount > currentCount &&
      currentTime - lastUpdate >= GAME_CONFIG.REPLENISH_INTERVAL) {
      console.log('Updating timestamp for:', item);
      return currentTime;
  }
  else return lastUpdate;
};
  

    //if (currentTime - lastUpdate < GAME_CONFIG.REPLENISH_INTERVAL) return lastUpdate;
//    return currentTime;
const getUserInventory = async (did) => {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      off_chain_balance,
      rock_count,
      paper_count,
      scissors_count,
      rock_count_last_update,
      paper_count_last_update,
      scissors_count_last_update,
      off_chain_balance_last_update
    `)
    .eq('did', did)
    .single();

  if (error) throw new Error('User not found');
  return user;
};

const updateInventoryInDB = async (did, updates) => {
  console.log('Updating inventory in DB:', updates);
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('did', did);

  if (error) throw new Error('Failed to update inventory');
};

const calculateNextReplenishTime = (currentCount, lastUpdate) => {
    // If at max moves, no replenish time needed
    if (currentCount >= GAME_CONFIG.MAX_MOVES) {
        return null;
    }
    
    // If no last update, they can replenish immediately
    if (lastUpdate === null) {
        return Date.now();
    }
    
    // Calculate next replenish time
    const nextTime = lastUpdate + GAME_CONFIG.REPLENISH_INTERVAL;
    return nextTime;
};

const calculateNextOffChainReplenishTime = (currentBalance, lastUpdate) => {
    // If balance is positive, no replenish needed
    if (currentBalance > 0) {
        return null;
    }
    
    // If no last update, they can replenish immediately
    if (lastUpdate === null) {
        return Date.now();
    }
    
    // Calculate next replenish time
    const nextTime = lastUpdate + GAME_CONFIG.OFF_CHAIN_BALANCE_INTERVAL;
    return nextTime;
};
