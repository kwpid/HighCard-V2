// Test file to verify rank image path generation
// This file can be removed after testing

import { getRankImagePath } from './utils';

// Test rank image path generation
const testRankPaths = () => {
  console.log('Testing rank image path generation:');
  
  // Test ranks with divisions
  console.log('Bronze I:', getRankImagePath('Bronze', 'I'));
  console.log('Silver II:', getRankImagePath('Silver', 'II'));
  console.log('Gold III:', getRankImagePath('Gold', 'III'));
  console.log('Platinum I:', getRankImagePath('Platinum', 'I'));
  console.log('Diamond II:', getRankImagePath('Diamond', 'II'));
  console.log('Champion III:', getRankImagePath('Champion', 'III'));
  console.log('Grand Champion I:', getRankImagePath('Grand Champion', 'I'));
  
  // Test ranks without divisions
  console.log('Card Legend:', getRankImagePath('Card Legend', null));
  
  // Test edge cases
  console.log('Empty rank:', getRankImagePath('', 'I'));
  console.log('Empty division:', getRankImagePath('Bronze', ''));
};

// Export for testing
export { testRankPaths };

// Uncomment the line below to run the test in the browser console
// testRankPaths();
