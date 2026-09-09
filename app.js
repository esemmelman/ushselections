export const services = [
  ['Erev Rosh Hashana', 'usher_erev_rosh_hashana_selected', 'Fri., Sep. 11 @ 7:30 pm.'],
  ['Rosh Hashana', 'usher_rosh_hashana_selected', 'Sat., Sep. 12 @ 10:00 am.'],
  ['Kol Nidre', 'usher_kol_nidre_selected', 'Sun., Sep. 20 @ 7:30 pm.'],
  ['Yom Kippur', 'usher_yom_kippur_morning_selected', 'Mon., Sep. 21 @ 10:00 am.'],
  ['Mincha', 'usher_yom_kippur_afternoon_evening_selected', 'Mon., Sep  21 @ 3:30 pm.'],
];
const api = 'https://fgomaujsdblpzxhnnqrg.supabase.co/rest/v1/usher_high_holiday_volunteers_2026_v1';
// Publishable browser key. Access is restricted by database grants and RLS.
const key = 'sb_publishable_JOUqLZDnfGu_yCa6k6FVDQ_AYwpr72i';
export function groupVolunteers(rows) {
  return services.map(([title, column, schedule]) => ({
    title,
    schedule,
    names: rows.filter(row => row[column] === true && typeof row.usher_volunteer_name === 'string' && row.usher_volunteer_name.trim())
      .map(row => row.usher_volunteer_name.trim()).sort((a, b) => a.localeCompare(b)),
  }));
}
export async function fetchVolunteers() {
  const rows = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const url = new URL(api);
    url.searchParams.set('select', ['usher_volunteer_name', ...services.map(([, column]) => column)].join(','));
    url.searchParams.set('order', 'usher_volunteer_name.asc,' + services.map(([, column]) => column + '.asc').join(','));
    url.searchParams.set('offset', offset);
    url.searchParams.set('limit', pageSize);
    const response = await fetch(url, { headers: { apikey: key }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Volunteer request failed (${response.status})`);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error('Unexpected volunteer response');
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
if (typeof document !== 'undefined') {
  const board = document.querySelector('#board');
  const status = document.querySelector('#status');
  const refresh = document.querySelector('#refresh');
  let loaded = false;
  function render(groups, loading = false) {
    board.replaceChildren(...groups.map(({title, schedule, names}) => {
      const section = document.createElement('section');
      section.className = 'service';
      const header = document.createElement('div');
      header.className = 'service-header';
      const heading = document.createElement('h2');
      heading.textContent = title;
      const date = document.createElement('p');
      date.className = 'schedule';
      date.textContent = schedule;
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = loading ? '—' : `${names.length} volunteer${names.length === 1 ? '' : 's'}`;
      header.append(heading, date, count);
      section.append(header);
      if (names.length) {
        const list = document.createElement('ul');
        names.forEach(name => { const item = document.createElement('li'); item.textContent = name; list.append(item); });
        section.append(list);
      } else {
        const empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = loading ? 'Waiting for volunteer list…' : 'No volunteers yet.';
        section.append(empty);
      }
      return section;
    }));
  }
  async function update() {
    if (refresh.disabled) return;
    refresh.disabled = true;
    board.setAttribute('aria-busy', 'true');
    try {
      render(groupVolunteers(await fetchVolunteers()));
      loaded = true;
      status.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } catch (error) {
      status.textContent = loaded ? 'Refresh failed. Showing the last loaded names; try Refresh.' : 'Unable to load volunteers. Please try Refresh.';
      if (!loaded) board.querySelectorAll('.empty').forEach(item => { item.textContent = 'Volunteer list unavailable.'; });
      console.error(error);
    } finally {
      refresh.disabled = false;
      board.setAttribute('aria-busy', 'false');
    }
  }
  render(groupVolunteers([]), true);
  refresh.addEventListener('click', update);
  update();
  setInterval(() => { if (!document.hidden) update(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}
