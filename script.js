(() => {
	const today = new Date();
	const isoDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};
	const addDays = (count) => {
		const date = new Date(today);
		date.setDate(date.getDate() + count);
		return isoDate(date);
	};
	const formatDate = (date, options = { month: 'short', day: 'numeric' }) => {
		if (!date) return '—';
		return new Intl.DateTimeFormat('en-US', options).format(new Date(`${date}T12:00:00`));
	};
	const roomSeed = [
		{ number: '101', type: 'Garden queen', floor: '1st floor', rate: 189, housekeeping: 'clean' },
		{ number: '102', type: 'Garden queen', floor: '1st floor', rate: 189, housekeeping: 'clean' },
		{ number: '103', type: 'Garden queen', floor: '1st floor', rate: 189, housekeeping: 'dirty' },
		{ number: '104', type: 'Garden queen', floor: '1st floor', rate: 189, housekeeping: 'inspected' },
		{ number: '201', type: 'City king', floor: '2nd floor', rate: 229, housekeeping: 'clean' },
		{ number: '202', type: 'City king', floor: '2nd floor', rate: 229, housekeeping: 'clean' },
		{ number: '203', type: 'City king', floor: '2nd floor', rate: 229, housekeeping: 'dirty' },
		{ number: '204', type: 'City king', floor: '2nd floor', rate: 229, housekeeping: 'clean' },
		{ number: '205', type: 'Corner suite', floor: '2nd floor', rate: 329, housekeeping: 'inspected' },
		{ number: '301', type: 'City king', floor: '3rd floor', rate: 249, housekeeping: 'clean' },
		{ number: '302', type: 'Corner suite', floor: '3rd floor', rate: 349, housekeeping: 'clean' },
		{ number: '303', type: 'Corner suite', floor: '3rd floor', rate: 349, housekeeping: 'dirty' },
		{ number: '304', type: 'Penthouse', floor: '3rd floor', rate: 489, housekeeping: 'inspected' },
		{ number: '305', type: 'Penthouse', floor: '3rd floor', rate: 489, housekeeping: 'clean' }
	];
	const sampleBookings = [
		{ id: 'MH-2841', guest: 'Alice Chen', email: 'alice.chen@example.com', phone: '+1 (503) 555-0182', room: '204', checkin: addDays(0), checkout: addDays(2), guests: 2, status: 'checked-in', notes: '' },
		{ id: 'MH-2842', guest: 'Mateo Rivera', email: 'mateo.rivera@example.com', phone: '+1 (415) 555-0134', room: '301', checkin: addDays(0), checkout: addDays(3), guests: 2, status: 'confirmed', notes: 'Late arrival' },
		{ id: 'MH-2843', guest: 'Samira Patel', email: 'samira.patel@example.com', phone: '+1 (206) 555-0190', room: '102', checkin: addDays(-1), checkout: addDays(0), guests: 1, status: 'checked-in', notes: '' },
		{ id: 'MH-2844', guest: 'Theo Williams', email: 'theo.williams@example.com', phone: '+1 (971) 555-0108', room: '205', checkin: addDays(1), checkout: addDays(4), guests: 2, status: 'confirmed', notes: 'Anniversary' },
		{ id: 'MH-2845', guest: 'Ava Johnson', email: 'ava.johnson@example.com', phone: '+1 (312) 555-0173', room: '303', checkin: addDays(2), checkout: addDays(5), guests: 3, status: 'confirmed', notes: '' },
		{ id: 'MH-2846', guest: 'Luca Brooks', email: 'luca.brooks@example.com', phone: '+1 (503) 555-0127', room: '103', checkin: addDays(0), checkout: addDays(1), guests: 1, status: 'checked-in', notes: '' },
		{ id: 'MH-2847', guest: 'Noah Kim', email: 'noah.kim@example.com', phone: '+1 (425) 555-0161', room: '201', checkin: addDays(-3), checkout: addDays(-1), guests: 2, status: 'checked-out', notes: '' },
		{ id: 'MH-2848', guest: 'Priya Shah', email: 'priya.shah@example.com', phone: '+1 (510) 555-0149', room: '302', checkin: addDays(4), checkout: addDays(6), guests: 2, status: 'confirmed', notes: 'Feather-free room' }
	];
	const readStore = (key, fallback) => {
		try {
			const saved = localStorage.getItem(key);
			return saved ? JSON.parse(saved) : fallback;
		} catch {
			return fallback;
		}
	};
	const state = {
		rooms: readStore('morrow-rooms', roomSeed),
		bookings: readStore('morrow-bookings', sampleBookings),
		view: 'overview',
		search: '',
		reservationFilter: 'all'
	};
	const page = document.querySelector('#page-content');
	const dialog = document.querySelector('#booking-dialog');
	const bookingForm = document.querySelector('#booking-form');
	const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
	const saveState = () => {
		localStorage.setItem('morrow-rooms', JSON.stringify(state.rooms));
		localStorage.setItem('morrow-bookings', JSON.stringify(state.bookings));
	};
	const activeBookings = () => state.bookings.filter((booking) => ['confirmed', 'checked-in'].includes(booking.status));
	const bookingForRoomToday = (roomNumber) => activeBookings().find((booking) => booking.room === roomNumber && booking.checkin <= isoDate(today) && booking.checkout > isoDate(today));
	const statusLabel = (status) => ({ 'checked-in': 'Checked in', 'checked-out': 'Checked out', confirmed: 'Confirmed', cancelled: 'Cancelled' })[status] || status;
	const housekeepingLabel = (status) => ({ clean: 'Clean', dirty: 'Needs cleaning', cleaning: 'In progress', inspected: 'Inspected' })[status] || status;
	const initials = (name) => name.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
	const matchesSearch = (...values) => !state.search || values.join(' ').toLowerCase().includes(state.search.toLowerCase());
	const icon = (name, className = '') => `<i data-lucide="${name}"${className ? ` class="${className}"` : ''}></i>`;
	const refreshIcons = () => window.lucide?.createIcons();
	const toast = (message, iconName = 'check') => {
		const region = document.querySelector('#toast-region');
		const item = document.createElement('div');
		item.className = 'toast';
		item.innerHTML = `${icon(iconName)}<span>${escapeHtml(message)}</span>`;
		region.append(item);
		refreshIcons();
		window.setTimeout(() => item.remove(), 3200);
	};
	const getRoomAvailability = (room, checkin, checkout) => {
		const conflict = activeBookings().some((booking) => booking.room === room.number && booking.checkin < checkout && booking.checkout > checkin);
		return !conflict;
	};
	const updateReservationCount = () => {
		document.querySelector('#reservation-count').textContent = state.bookings.filter((booking) => booking.status === 'confirmed').length;
	};
	const reservationRows = (bookings) => bookings.map((booking) => {
		const action = booking.status === 'confirmed'
			? `<div class="row-actions"><button class="row-action" data-action="check-in" data-id="${escapeHtml(booking.id)}">Check in</button><button class="row-action row-cancel" data-action="cancel" data-id="${escapeHtml(booking.id)}">Cancel</button></div>`
			: booking.status === 'checked-in'
				? `<button class="row-action" data-action="check-out" data-id="${escapeHtml(booking.id)}">Check out</button>`
				: '';
		return `<tr>
			<td><span class="booking-id">${escapeHtml(booking.id)}</span></td>
			<td><div class="guest-cell"><span class="avatar avatar-soft">${escapeHtml(initials(booking.guest))}</span><span><strong>${escapeHtml(booking.guest)}</strong><small>${escapeHtml(booking.email)}</small></span></div></td>
			<td><span class="room-number">${escapeHtml(booking.room)}</span></td>
			<td>${formatDate(booking.checkin)} <span class="date-arrow">→</span> ${formatDate(booking.checkout)}</td>
			<td>${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}</td>
			<td><span class="status-pill status-${escapeHtml(booking.status)}"><span></span>${statusLabel(booking.status)}</span></td>
			<td class="row-action-cell">${action || '<span class="muted-dash">—</span>'}</td>
		</tr>`;
	}).join('');
	const reservationTable = (bookings, compact = false) => `<div class="table-scroll"><table class="data-table${compact ? ' compact-table' : ''}"><thead><tr><th>BOOKING</th><th>GUEST</th><th>ROOM</th><th>STAY</th><th>PARTY</th><th>STATUS</th><th></th></tr></thead><tbody>${bookings.length ? reservationRows(bookings) : '<tr><td class="empty-cell" colspan="7">No reservations found.</td></tr>'}</tbody></table></div>`;
	const roomState = (room) => {
		const booking = bookingForRoomToday(room.number);
		if (booking?.status === 'checked-in') return { key: 'occupied', label: 'Occupied', booking };
		if (booking) return { key: 'reserved', label: 'Arriving today', booking };
		if (room.housekeeping === 'dirty') return { key: 'dirty', label: 'Needs cleaning' };
		if (room.housekeeping === 'cleaning') return { key: 'cleaning', label: 'In progress' };
		return { key: 'available', label: room.housekeeping === 'inspected' ? 'Inspected' : 'Available' };
	};
	const roomCards = (rooms) => rooms.map((room) => {
		const status = roomState(room);
		const guest = status.booking ? `<div class="room-guest">${icon('user-round')} ${escapeHtml(status.booking.guest)}</div>` : `<div class="room-guest room-guest-muted">${escapeHtml(housekeepingLabel(room.housekeeping))}</div>`;
		const task = ['dirty', 'cleaning'].includes(room.housekeeping) && !status.booking
			? `<button class="room-task" data-action="clean-room" data-room="${escapeHtml(room.number)}">${room.housekeeping === 'dirty' ? 'Start clean' : 'Mark clean'} ${icon('arrow-right')}</button>`
			: `<span class="room-rate">$${room.rate} <small>/ night</small></span>`;
		return `<article class="room-card"><div class="room-card-top"><span class="room-number-large">${escapeHtml(room.number)}</span><span class="room-status status-room-${status.key}"><span></span>${status.label}</span></div><div class="room-type">${escapeHtml(room.type)} <span>·</span> ${escapeHtml(room.floor)}</div>${guest}<div class="room-card-bottom">${task}</div></article>`;
	}).join('');
	const pageHeading = (eyebrow, title, description, actions = '') => `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><div class="heading-actions">${actions}</div></div>`;
	const button = (label, iconName, extra = '') => `<button class="button button-primary ${extra}" data-action="new-booking">${icon(iconName)} ${label}</button>`;
	const renderOverview = () => {
		const todayBookings = state.bookings.filter((booking) => booking.checkin === isoDate(today) && ['confirmed', 'checked-in'].includes(booking.status));
		const arrivals = todayBookings.filter((booking) => booking.status === 'confirmed');
		const occupied = state.rooms.filter((room) => bookingForRoomToday(room.number)?.status === 'checked-in').length;
		const departures = state.bookings.filter((booking) => booking.checkout === isoDate(today) && booking.status === 'checked-in').length;
		const occupancy = Math.round((occupied / state.rooms.length) * 100);
		const revenue = state.bookings.filter((booking) => booking.status === 'checked-in' || (booking.status === 'confirmed' && booking.checkin === isoDate(today))).reduce((sum, booking) => sum + (state.rooms.find((room) => room.number === booking.room)?.rate || 0), 0);
		const nextArrivals = arrivals.filter((booking) => matchesSearch(booking.id, booking.guest, booking.email, booking.room)).slice(0, 5);
		return `${pageHeading(formatDate(isoDate(today), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(), 'Good morning, Jordan', 'Here is what is happening at your hotel today.', button('New reservation', 'plus'))}
			<div class="metric-grid">
				<article class="metric-card"><div class="metric-top"><span>Occupancy</span><span class="metric-icon metric-icon-green">${icon('door-open')}</span></div><div class="metric-value">${occupancy}<small>%</small></div><div class="metric-foot"><span class="trend-up">${occupied} rooms occupied</span><span>of ${state.rooms.length} rooms</span></div><div class="metric-progress"><span style="width:${occupancy}%"></span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Arrivals today</span><span class="metric-icon metric-icon-blue">${icon('log-in')}</span></div><div class="metric-value">${arrivals.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span class="trend-neutral">${arrivals.filter((item) => item.status === 'confirmed').length} expected</span><span>across ${new Set(arrivals.map((item) => item.room)).size} rooms</span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Departures</span><span class="metric-icon metric-icon-amber">${icon('log-out')}</span></div><div class="metric-value">${departures.toString().padStart(2, '0')}</div><div class="metric-foot"><span class="trend-neutral">${departures ? 'Before 11:00 AM' : 'No check-outs due'}</span><span>today</span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Room revenue</span><span class="metric-icon metric-icon-coral">${icon('wallet')}</span></div><div class="metric-value metric-currency">$${revenue.toLocaleString('en-US')}</div><div class="metric-foot"><span class="trend-up">Today so far</span><span>room revenue</span></div></article>
			</div>
			<div class="dashboard-grid">
				<section class="panel arrivals-panel"><div class="panel-heading"><div><h2>Today's arrivals</h2><p>${arrivals.length} guests checking in</p></div><button class="subtle-link" data-view="reservations">All reservations ${icon('arrow-up-right')}</button></div>${reservationTable(nextArrivals, true)}</section>
				<section class="panel activity-panel"><div class="panel-heading"><div><h2>At a glance</h2><p>Property pulse for today</p></div><span class="live-dot"><span></span> LIVE</span></div>
					<div class="pulse-row"><span class="pulse-icon pulse-green">${icon('bed-double')}</span><span><strong>${state.rooms.filter((room) => roomState(room).key === 'available').length} rooms ready</strong><small>Clean and available to sell</small></span><i data-lucide="chevron-right"></i></div>
					<div class="pulse-row"><span class="pulse-icon pulse-amber">${icon('sparkles')}</span><span><strong>${state.rooms.filter((room) => ['dirty', 'cleaning'].includes(room.housekeeping)).length} rooms need attention</strong><small>Housekeeping tasks outstanding</small></span><i data-lucide="chevron-right"></i></div>
					<div class="occupancy-mini"><div class="occupancy-copy"><span>Room occupancy</span><strong>${occupancy}%</strong></div><div class="mini-bars">${state.rooms.map((room) => `<span class="mini-bar ${roomState(room).key === 'occupied' ? 'bar-filled' : roomState(room).key === 'reserved' ? 'bar-reserved' : ''}"></span>`).join('')}</div><div class="legend"><span><i class="legend-occupied"></i>Occupied</span><span><i class="legend-reserved"></i>Reserved</span><span><i class="legend-open"></i>Available</span></div></div>
				</section>
			</div>
			<section class="panel room-board-panel"><div class="panel-heading"><div><h2>Room board</h2><p>Live status across the property</p></div><button class="subtle-link" data-view="rooms">Open room board ${icon('arrow-up-right')}</button></div><div class="room-grid room-grid-preview">${roomCards(state.rooms.filter((room) => matchesSearch(room.number, room.type, roomState(room).booking?.guest)).slice(0, 4))}</div></section>`;
	};
	const renderReservations = () => {
		let bookings = state.bookings.filter((booking) => matchesSearch(booking.id, booking.guest, booking.email, booking.room, booking.status));
		if (state.reservationFilter !== 'all') bookings = bookings.filter((booking) => booking.status === state.reservationFilter);
		bookings = bookings.sort((first, second) => first.checkin.localeCompare(second.checkin));
		const filters = [['all', 'All stays'], ['confirmed', 'Confirmed'], ['checked-in', 'In house'], ['checked-out', 'Checked out']];
		return `${pageHeading('FRONT DESK', 'Reservations', 'Manage stays, arrivals, and departures.', button('New reservation', 'plus'))}<section class="panel full-panel"><div class="list-toolbar"><div class="filter-tabs">${filters.map(([value, label]) => `<button class="filter-tab ${state.reservationFilter === value ? 'selected' : ''}" data-filter="${value}">${label}${value === 'all' ? `<span>${state.bookings.length}</span>` : ''}</button>`).join('')}</div><button class="button button-outline" data-action="export-bookings">${icon('download')} Export</button></div>${reservationTable(bookings)}</section>`;
	};
	const renderRooms = () => {
		const available = state.rooms.filter((room) => roomState(room).key === 'available').length;
		const occupied = state.rooms.filter((room) => roomState(room).key === 'occupied').length;
		const needsAttention = state.rooms.filter((room) => ['dirty', 'cleaning'].includes(room.housekeeping)).length;
		return `${pageHeading('PROPERTY', 'Room board', 'A live view of every room at Morrow House.')}
			<div class="room-summary"><div><span class="summary-dot dot-green"></span><strong>${available}</strong> available</div><div><span class="summary-dot dot-blue"></span><strong>${occupied}</strong> occupied</div><div><span class="summary-dot dot-amber"></span><strong>${needsAttention}</strong> need attention</div></div>
			<div class="floor-heading"><h2>All rooms</h2><span>${state.rooms.length} keys · 3 floors</span></div><div class="room-grid room-grid-full">${roomCards(state.rooms.filter((room) => matchesSearch(room.number, room.type, roomState(room).booking?.guest)))}</div>`;
	};
	const getGuests = () => {
		const guests = new Map();
		state.bookings.forEach((booking) => {
			const guest = guests.get(booking.email) || { ...booking, stays: 0, lastStay: booking.checkin };
			guest.stays += 1;
			if (booking.checkin > guest.lastStay) guest.lastStay = booking.checkin;
			guests.set(booking.email, guest);
		});
		return [...guests.values()].filter((guest) => matchesSearch(guest.guest, guest.email, guest.phone)).sort((first, second) => first.guest.localeCompare(second.guest));
	};
	const renderGuests = () => {
		const guests = getGuests();
		const rows = guests.map((guest) => `<tr><td><div class="guest-cell"><span class="avatar avatar-soft">${escapeHtml(initials(guest.guest))}</span><span><strong>${escapeHtml(guest.guest)}</strong><small>${escapeHtml(guest.email)}</small></span></div></td><td>${escapeHtml(guest.phone || '—')}</td><td>${guest.stays} ${guest.stays === 1 ? 'stay' : 'stays'}</td><td>${formatDate(guest.lastStay, { month: 'long', day: 'numeric', year: 'numeric' })}</td><td><button class="icon-button guest-more" data-action="guest-details" data-email="${escapeHtml(guest.email)}" aria-label="Guest details">${icon('arrow-up-right')}</button></td></tr>`).join('');
		return `${pageHeading('RELATIONSHIPS', 'Guests', 'Get to know the people who make your hotel special.')}
			<div class="metric-grid guest-metrics"><article class="metric-card"><div class="metric-top"><span>Total guests</span><span class="metric-icon metric-icon-green">${icon('users-round')}</span></div><div class="metric-value">${guests.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Guest profiles</span><span>on file</span></div></article><article class="metric-card"><div class="metric-top"><span>Returning guests</span><span class="metric-icon metric-icon-blue">${icon('repeat-2')}</span></div><div class="metric-value">${guests.filter((guest) => guest.stays > 1).length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>More than one stay</span><span>this season</span></div></article></div>
			<section class="panel full-panel"><div class="panel-heading"><div><h2>Guest directory</h2><p>Guest details collected from reservations</p></div><span class="record-count">${guests.length} records</span></div><div class="table-scroll"><table class="data-table guest-table"><thead><tr><th>GUEST</th><th>PHONE</th><th>STAYS</th><th>LAST BOOKING</th><th></th></tr></thead><tbody>${rows || '<tr><td class="empty-cell" colspan="5">No guests found.</td></tr>'}</tbody></table></div></section>`;
	};
	const renderHousekeeping = () => {
		const rooms = state.rooms.filter((room) => matchesSearch(room.number, room.type, housekeepingLabel(room.housekeeping)));
		const counts = ['dirty', 'cleaning', 'clean', 'inspected'].map((status) => [status, state.rooms.filter((room) => room.housekeeping === status).length]);
		const housekeepingRows = rooms.map((room) => {
			const occupied = bookingForRoomToday(room.number);
			const action = room.housekeeping === 'dirty' ? 'Start cleaning' : room.housekeeping === 'cleaning' ? 'Mark clean' : room.housekeeping === 'clean' ? 'Inspect room' : 'Mark needs cleaning';
			return `<tr><td><span class="room-number">${escapeHtml(room.number)}</span></td><td>${escapeHtml(room.type)}</td><td>${occupied ? escapeHtml(occupied.guest) : '<span class="muted-dash">—</span>'}</td><td><span class="housekeeping-pill house-${room.housekeeping}"><span></span>${housekeepingLabel(room.housekeeping)}</span></td><td><button class="row-action" data-action="cycle-housekeeping" data-room="${escapeHtml(room.number)}">${action}</button></td></tr>`;
		}).join('');
		return `${pageHeading('ROOM OPERATIONS', 'Housekeeping', 'Keep every room guest-ready, one task at a time.')}
			<div class="housekeeping-stats">${counts.map(([status, count]) => `<div><span class="housekeeping-pill house-${status}"><span></span>${housekeepingLabel(status)}</span><strong>${count}</strong></div>`).join('')}</div>
			<section class="panel full-panel"><div class="panel-heading"><div><h2>Room tasks</h2><p>Update room status as work is completed</p></div></div><div class="table-scroll"><table class="data-table housekeeping-table"><thead><tr><th>ROOM</th><th>ROOM TYPE</th><th>IN-HOUSE GUEST</th><th>STATUS</th><th></th></tr></thead><tbody>${housekeepingRows}</tbody></table></div></section>`;
	};
	const renderReports = () => {
		const occupied = state.rooms.filter((room) => bookingForRoomToday(room.number)?.status === 'checked-in').length;
		const occupancy = Math.round((occupied / state.rooms.length) * 100);
		const active = activeBookings();
		const averageRate = active.length ? Math.round(active.reduce((sum, booking) => sum + (state.rooms.find((room) => room.number === booking.room)?.rate || 0), 0) / active.length) : 0;
		const revenue = active.reduce((sum, booking) => sum + (state.rooms.find((room) => room.number === booking.room)?.rate || 0), 0);
		const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const values = [38, 55, 48, 73, 62, 91, occupancy || 14];
		return `${pageHeading('INSIGHTS', 'Reports', 'A snapshot of how your property is performing.')}
			<div class="metric-grid"><article class="metric-card"><div class="metric-top"><span>Occupancy today</span>${icon('chart-no-axes-combined', 'metric-plain-icon')}</div><div class="metric-value">${occupancy}<small>%</small></div><div class="metric-foot"><span>Based on checked-in rooms</span><span>${state.rooms.length} keys</span></div></article><article class="metric-card"><div class="metric-top"><span>Average daily rate</span>${icon('badge-dollar-sign', 'metric-plain-icon')}</div><div class="metric-value metric-currency">$${averageRate}</div><div class="metric-foot"><span>For active reservations</span><span>per night</span></div></article><article class="metric-card"><div class="metric-top"><span>Room revenue</span>${icon('wallet', 'metric-plain-icon')}</div><div class="metric-value metric-currency">$${revenue.toLocaleString('en-US')}</div><div class="metric-foot"><span>Active stay value</span><span>per night</span></div></article><article class="metric-card"><div class="metric-top"><span>Confirmed stays</span>${icon('calendar-check-2', 'metric-plain-icon')}</div><div class="metric-value">${state.bookings.filter((booking) => booking.status === 'confirmed').length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Upcoming reservations</span><span>on the books</span></div></article></div>
			<div class="report-grid"><section class="panel report-panel"><div class="panel-heading"><div><h2>Occupancy trend</h2><p>Daily room occupancy · this week</p></div><span class="report-period">This week ${icon('chevron-down')}</span></div><div class="chart-wrap"><div class="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div class="chart-area"><div class="chart-grid-lines"><i></i><i></i><i></i><i></i><i></i></div><div class="chart-bars">${week.map((day, index) => `<div class="chart-day"><div class="chart-bar-column"><span class="chart-bar ${index === 6 ? 'chart-bar-today' : ''}" style="height:${values[index]}%" title="${values[index]}%"></span></div><span>${day}</span></div>`).join('')}</div></div></div></section><section class="panel report-panel mix-panel"><div class="panel-heading"><div><h2>Room mix</h2><p>Inventory by room type</p></div></div><div class="mix-list">${[...new Set(state.rooms.map((room) => room.type))].map((type, index) => { const count = state.rooms.filter((room) => room.type === type).length; const colors = ['mix-green', 'mix-blue', 'mix-amber', 'mix-coral']; return `<div class="mix-item"><span class="mix-dot ${colors[index % colors.length]}"></span><span>${escapeHtml(type)}</span><strong>${count}</strong><div class="mix-track"><i class="${colors[index % colors.length]}" style="width:${(count / state.rooms.length) * 100}%"></i></div></div>`; }).join('')}</div></section></div>`;
	};
	const renderSettings = () => `${pageHeading('PROPERTY', 'Settings', 'Property details and front desk preferences.')}
		<section class="panel settings-panel"><div class="settings-section"><div><h2>Property profile</h2><p>Information shown to your team</p></div><div class="settings-form"><label class="field">Property name<input value="Morrow House" id="property-name"></label><label class="field">Location<input value="Portland, Oregon" id="property-location"></label><label class="field">Default check-in time<input value="3:00 PM" id="checkin-time"></label><label class="field">Default check-out time<input value="11:00 AM" id="checkout-time"></label><button class="button button-primary" data-action="save-settings">${icon('check')} Save changes</button></div></div><div class="settings-section settings-danger"><div><h2>Demo data</h2><p>Restore the original sample reservations and room statuses.</p></div><button class="button button-outline" data-action="reset-demo">${icon('rotate-ccw')} Reset demo data</button></div></section>`;
	const render = () => {
		const views = { overview: renderOverview, reservations: renderReservations, rooms: renderRooms, guests: renderGuests, housekeeping: renderHousekeeping, reports: renderReports, settings: renderSettings };
		const titles = { overview: 'Overview', reservations: 'Reservations', rooms: 'Rooms', guests: 'Guests', housekeeping: 'Housekeeping', reports: 'Reports', settings: 'Settings' };
		page.innerHTML = (views[state.view] || renderOverview)();
		document.querySelector('#breadcrumb-current').textContent = titles[state.view] || titles.overview;
		document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === state.view));
		updateReservationCount();
		refreshIcons();
	};
	const openBookingDialog = () => {
		const roomSelect = bookingForm.elements.room;
		const checkin = bookingForm.elements.checkin.value || isoDate(today);
		const checkout = bookingForm.elements.checkout.value || addDays(1);
		const availableRooms = state.rooms.filter((room) => getRoomAvailability(room, checkin, checkout));
		roomSelect.innerHTML = availableRooms.map((room) => `<option value="${escapeHtml(room.number)}">${escapeHtml(room.number)} · ${escapeHtml(room.type)} · $${room.rate}/night</option>`).join('');
		if (!availableRooms.length) {
			toast('No rooms available for those dates.', 'calendar-x');
			return;
		}
		if (!bookingForm.elements.checkin.value) bookingForm.elements.checkin.value = isoDate(today);
		if (!bookingForm.elements.checkout.value) bookingForm.elements.checkout.value = addDays(1);
		bookingForm.elements.checkin.min = isoDate(today);
		bookingForm.elements.checkout.min = addDays(1);
		dialog.showModal();
		refreshIcons();
	};
	const setView = (view) => {
		if (!view) return;
		state.view = view;
		document.querySelector('#sidebar').classList.remove('sidebar-open');
		render();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};
	const cycleHousekeeping = (room) => {
		const order = ['dirty', 'cleaning', 'clean', 'inspected'];
		const current = order.indexOf(room.housekeeping);
		room.housekeeping = order[(current + 1) % order.length];
	};
	document.addEventListener('click', (event) => {
		const viewButton = event.target.closest('[data-view]');
		if (viewButton) return setView(viewButton.dataset.view);
		const filterButton = event.target.closest('[data-filter]');
		if (filterButton) {
			state.reservationFilter = filterButton.dataset.filter;
			return render();
		}
		const actionButton = event.target.closest('[data-action]');
		if (!actionButton) return;
		const { action, id, room: roomNumber } = actionButton.dataset;
		if (action === 'new-booking') return openBookingDialog();
		if (action === 'check-in' || action === 'check-out') {
			const booking = state.bookings.find((item) => item.id === id);
			if (!booking) return;
			booking.status = action === 'check-in' ? 'checked-in' : 'checked-out';
			if (action === 'check-out') {
				const room = state.rooms.find((item) => item.number === booking.room);
				if (room) room.housekeeping = 'dirty';
			}
			saveState();
			render();
			return toast(`${booking.guest} ${action === 'check-in' ? 'checked in' : 'checked out'}.`);
		}
		if (action === 'cancel') {
			const booking = state.bookings.find((item) => item.id === id);
			if (!booking || !window.confirm(`Cancel reservation for ${booking.guest}?`)) return;
			booking.status = 'cancelled';
			saveState();
			render();
			return toast(`Reservation ${booking.id} cancelled.`, 'calendar-x');
		}
		if (action === 'clean-room' || action === 'cycle-housekeeping') {
			const room = state.rooms.find((item) => item.number === roomNumber);
			if (!room) return;
			if (action === 'clean-room') room.housekeeping = room.housekeeping === 'dirty' ? 'cleaning' : 'clean';
			else cycleHousekeeping(room);
			saveState();
			render();
			return toast(`Room ${room.number}: ${housekeepingLabel(room.housekeeping).toLowerCase()}.`);
		}
		if (action === 'guest-details') {
			const guest = state.bookings.find((item) => item.email === actionButton.dataset.email);
			if (guest) toast(`${guest.guest} · ${guest.phone || guest.email}`, 'user-round');
			return;
		}
		if (action === 'export-bookings') {
			const headers = ['Booking', 'Guest', 'Email', 'Room', 'Check-in', 'Check-out', 'Guests', 'Status'];
			const rows = state.bookings.map((item) => [item.id, item.guest, item.email, item.room, item.checkin, item.checkout, item.guests, statusLabel(item.status)]);
			const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
			const link = document.createElement('a');
			link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
			link.download = 'morrow-house-reservations.csv';
			link.click();
			URL.revokeObjectURL(link.href);
			return toast('Reservations exported.');
		}
		if (action === 'save-settings') return toast('Property settings saved.');
		if (action === 'reset-demo') {
			state.bookings = sampleBookings.map((booking) => ({ ...booking }));
			state.rooms = roomSeed.map((room) => ({ ...room }));
			saveState();
			render();
			return toast('Sample data restored.');
		}
	});
	document.querySelector('#global-search').addEventListener('input', (event) => {
		state.search = event.target.value.trim();
		render();
		const search = document.querySelector('#global-search');
		search.focus();
		search.setSelectionRange(search.value.length, search.value.length);
	});
	bookingForm.elements.checkin.addEventListener('change', () => {
		const nextDay = new Date(`${bookingForm.elements.checkin.value}T12:00:00`);
		nextDay.setDate(nextDay.getDate() + 1);
		bookingForm.elements.checkout.min = isoDate(nextDay);
		if (bookingForm.elements.checkout.value <= bookingForm.elements.checkin.value) bookingForm.elements.checkout.value = isoDate(nextDay);
	});
	bookingForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const formData = new FormData(bookingForm);
		const checkin = String(formData.get('checkin'));
		const checkout = String(formData.get('checkout'));
		const roomNumber = String(formData.get('room'));
		if (checkout <= checkin) return toast('Check-out must be after check-in.', 'circle-alert');
		const room = state.rooms.find((item) => item.number === roomNumber);
		if (!room || !getRoomAvailability(room, checkin, checkout)) {
			toast('That room is no longer available for these dates.', 'circle-alert');
			return;
		}
		const guest = String(formData.get('guest')).trim();
		const booking = {
			id: `MH-${Math.floor(1000 + Math.random() * 9000)}`,
			guest,
			email: String(formData.get('email')).trim(),
			phone: String(formData.get('phone')).trim(),
			room: roomNumber,
			checkin,
			checkout,
			guests: Number(formData.get('guests')),
			status: 'confirmed',
			notes: String(formData.get('notes')).trim()
		};
		state.bookings.unshift(booking);
		saveState();
		bookingForm.reset();
		dialog.close();
		state.view = 'reservations';
		render();
		toast(`Reservation created for ${guest}.`);
	});
	document.querySelectorAll('[data-close-dialog]').forEach((buttonElement) => buttonElement.addEventListener('click', () => dialog.close()));
	document.querySelector('#notification-button').addEventListener('click', () => toast('You are all caught up.', 'bell'));
	document.querySelector('#support-button').addEventListener('click', () => toast('Support: hello@morrowhouse.example', 'headset'));
	document.querySelector('#profile-button').addEventListener('click', () => toast('Signed in as Jordan Lee.', 'user-round'));
	document.querySelector('#top-avatar').addEventListener('click', () => toast('Signed in as Jordan Lee.', 'user-round'));
	document.querySelector('#menu-button').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('sidebar-open'));
	document.addEventListener('keydown', (event) => {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			document.querySelector('#global-search').focus();
		}
	});
	render();
})();