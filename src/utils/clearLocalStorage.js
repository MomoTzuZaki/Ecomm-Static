// Utility to clear all localStorage data related to Tech Cycle
export const clearTechCycleLocalStorage = () => {
  const keysToRemove = [
    'techCycleUsers',
    'techCycleUser', 
    'authToken',
    'techCycleProducts',
    'techCycleCart',
    'techCycleVerifications'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('🧹 Cleared all Tech Cycle localStorage data');
};
// Note: No auto-clear on import. Call clearTechCycleLocalStorage() manually when needed.
