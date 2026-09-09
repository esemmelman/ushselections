import test from 'node:test';
import assert from 'node:assert/strict';
import { groupVolunteers, services } from './app.js';
test('each service includes only true selections and sorts names', () => {
  const rows = [
    { usher_volunteer_name: 'Zoe', ...Object.fromEntries(services.map(([, key]) => [key, true])) },
    { usher_volunteer_name: 'Amy', usher_yom_kippur_afternoon_evening_selected: true },
    { usher_volunteer_name: 'False', ...Object.fromEntries(services.map(([, key]) => [key, false])) },
    { usher_volunteer_name: 'String', usher_rosh_hashana_selected: 'true' },
    { usher_volunteer_name: null, usher_rosh_hashana_selected: true },
  ];
  const result = groupVolunteers(rows);
  assert.deepEqual(result.map(group => group.names), [['Zoe'], ['Zoe'], ['Zoe'], ['Zoe'], ['Amy', 'Zoe']]);
  assert.deepEqual(groupVolunteers([]).map(group => group.names), [[], [], [], [], []]);
});
