(() => {
	const today = new Date();
	const APP_NAME = 'Ellen Joe Hotel Manager';
	const DEFAULT_CONFIG = {
		hotelName: 'Morioh Grand Hotel',
		location: 'Morioh, Japan',
		features: {
			continentalBreakfast: true,
			pool: true
		}
	};
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
	const readStore = (key, fallback) => {
		try {
			const saved = localStorage.getItem(key);
			return saved ? JSON.parse(saved) : fallback;
		} catch {
			return fallback;
		}
	};
	const defaultState = {
		config: {
			...DEFAULT_CONFIG,
			features: { ...DEFAULT_CONFIG.features }
		},
		rooms: [
			{ number: '101', type: 'Queen Deluxe', floor: '1st floor', rate: 220, housekeeping: 'clean', assignedCleaner: 'Maya Ross' },
			{ number: '203', type: 'King Suite', floor: '2nd floor', rate: 315, housekeeping: 'dirty', assignedCleaner: 'Theo Silva' },
			{ number: '304', type: 'Garden Studio', floor: '3rd floor', rate: 260, housekeeping: 'cleaning', assignedCleaner: 'Maya Ross' },
			{ number: '408', type: 'Family Room', floor: '4th floor', rate: 285, housekeeping: 'inspected', assignedCleaner: null }
		],
		bookings: [
			{ id: 'MH-1024', guest: 'Alicia Gates', room: '101', checkin: isoDate(today), checkout: addDays(3), guests: 2, status: 'confirmed', notes: 'Early check-in if possible' },
			{ id: 'MH-2203', guest: 'Jamal Reed', room: '203', checkin: isoDate(today), checkout: addDays(2), guests: 2, status: 'checked-in', notes: 'King bed requested' },
			{ id: 'MH-3121', guest: 'Nora Price', room: '304', checkin: addDays(1), checkout: addDays(4), guests: 1, status: 'confirmed', notes: 'Quiet room' }
		],
		employees: [
			{ name: 'Ellen Joe', role: 'admin', salary: 75000, status: 'active' },
			{ name: 'Ellen Joe', role: 'manager', salary: 68000, status: 'active' },
			{ name: 'Maya Ross', role: 'cleaner', salary: 42000, status: 'active' },
			{ name: 'Theo Silva', role: 'cleaner', salary: 44000, status: 'active' },
			{ name: 'Harper Lane', role: 'cleaner2', salary: 42000, status: 'active' },
			{ name: 'Avery Stone', role: 'cook', salary: 46000, status: 'active' },
			{ name: 'Nina Holt', role: 'cook', salary: 46000, status: 'active' },
			{ name: 'Mila Brooks', role: 'lifeguard', salary: 39000, status: 'active' },
			{ name: 'Olivia Shaw', role: 'frontdesk', salary: 44000, status: 'active' },
			{ name: 'Jordan Lee', role: 'hr', salary: 58000, status: 'active' },
			{ name: 'Ava Brooks', role: 'support', salary: 44000, status: 'active' },
			{ name: 'Ethan Cole', role: 'valet', salary: 36000, status: 'active' },
			{ name: 'Marcus Reed', role: 'security', salary: 42000, status: 'active' },
			{ name: 'Miles Carter', role: 'bellhop', salary: 34000, status: 'active' },
			{ name: 'Grace Parker', role: 'roomservice', salary: 36000, status: 'active' }
		],
		breakfast: {
			serviceTime: '7:00 AM',
			menu: ['Pastries', 'Fresh fruit', 'Yogurt', 'Coffee'],
			cooks: ['Avery Stone', 'Nina Holt'],
			active: false
		},
		pool: { open: true },
		tickets: [
			{ id: 'T-410', guest: 'Mia Chen', room: '304', issue: 'Air conditioner is not cooling', priority: 'High', status: 'Open' },
			{ id: 'T-411', guest: 'Leon Hart', room: '101', issue: 'Requested extra towels', priority: 'Low', status: 'Resolved' }
		],
		currentUser: null,
		view: 'overview',
		configTab: 'property',
		reservationFilter: 'all'
	};
	const blankState = {
		blankTemplateVersion: 2,
		config: { hotelName: 'Blank Hotel', location: '', features: { continentalBreakfast: false, pool: false } },
		rooms: [],
		bookings: [],
		employees: [
			{ name: 'Ellen Joe', role: 'admin', salary: 75000, status: 'active' },
			{ name: 'Ellen Joe', role: 'manager', salary: 68000, status: 'active' }
		],
		breakfast: { serviceTime: '7:00 AM', menu: [], cooks: [], active: false },
		pool: { open: false },
		tickets: [],
		currentUser: null,
		view: 'overview',
		configTab: 'property',
		reservationFilter: 'all'
	};
	const BUILT_IN_HOTELS = [
		{ id: 'blank', name: blankState.config.hotelName, description: 'Start with an empty property and protected Admin and Manager accounts.', icon: 'building-2' },
		{ id: 'morioh', name: defaultState.config.hotelName, description: 'Open the sample rooms, bookings, team, breakfast, and pool setup.', icon: 'landmark' }
	];
	const cloneState = (value) => JSON.parse(JSON.stringify(value));
	const CUSTOM_HOTELS_STORAGE_KEY = 'ellenjoe-hotel-workspaces-v1';
	const savedCustomHotels = readStore(CUSTOM_HOTELS_STORAGE_KEY, []);
	let customHotels = Array.isArray(savedCustomHotels)
		? savedCustomHotels.filter((hotel) => hotel && typeof hotel.id === 'string' && /^custom-[a-z0-9-]+$/.test(hotel.id) && typeof hotel.name === 'string' && hotel.name.trim()).map((hotel) => ({
			id: hotel.id,
			name: hotel.name.trim(),
			description: typeof hotel.location === 'string' && hotel.location.trim() ? hotel.location.trim() : 'Custom hotel workspace',
			icon: 'building-2',
			location: typeof hotel.location === 'string' ? hotel.location : ''
		}))
		: [];
	const getHotelOptions = () => [...BUILT_IN_HOTELS, ...customHotels];
	const saveCustomHotels = () => localStorage.setItem(CUSTOM_HOTELS_STORAGE_KEY, JSON.stringify(customHotels));
	const salaryDefaults = { admin: 75000, manager: 68000, cleaner: 42000, cleaner2: 42000, cook: 46000, lifeguard: 39000, frontdesk: 44000, hr: 58000, support: 44000, valet: 36000, security: 42000, bellhop: 34000, roomservice: 36000 };
	const MORIOH_SAMPLE_EMPLOYEE_RENAMES = {
		'valet:Keiko Tanaka': 'Ethan Cole',
		'security:Riku Hayashi': 'Marcus Reed',
		'bellhop:Sora Fujimoto': 'Miles Carter',
		'roomservice:Yuna Matsuda': 'Grace Parker'
	};
	const normalizeHotelState = (savedState, hotelId) => {
		if (hotelId !== 'morioh' && savedState?.blankTemplateVersion !== 2) savedState = null;
		const defaults = hotelId === 'morioh' ? defaultState : blankState;
		const normalized = { ...cloneState(defaults), ...(savedState || {}) };
		normalized.config = {
			...defaults.config,
			...(savedState?.config || {}),
			features: { ...defaults.config.features, ...(savedState?.config?.features || {}) }
		};
		const customHotel = customHotels.find((hotel) => hotel.id === hotelId);
		if (customHotel) {
			normalized.config.hotelName = savedState?.config?.hotelName || customHotel.name;
			normalized.config.location = savedState?.config?.location ?? customHotel.location;
		}
		if (hotelId === 'morioh' && ['Ellen Joe Hotel', 'Ellen Joe Hotel Manager'].includes(normalized.config.hotelName)) normalized.config.hotelName = DEFAULT_CONFIG.hotelName;
		normalized.rooms = Array.isArray(savedState?.rooms) ? savedState.rooms : cloneState(defaults.rooms);
		normalized.bookings = Array.isArray(savedState?.bookings) ? savedState.bookings : cloneState(defaults.bookings);
		normalized.bookings.forEach((booking) => {
			delete booking.email;
			delete booking.phone;
		});
		normalized.employees = Array.isArray(savedState?.employees) ? savedState.employees : cloneState(defaults.employees);
		for (const protectedEmployee of defaults.employees.filter((employee) => ['admin', 'manager'].includes(employee.role))) {
			if (!normalized.employees.some((employee) => employee.role === protectedEmployee.role)) normalized.employees.push(cloneState(protectedEmployee));
		}
		if (hotelId === 'morioh') {
			for (const employee of normalized.employees) {
			const replacementName = MORIOH_SAMPLE_EMPLOYEE_RENAMES[`${employee.role}:${employee.name}`]
					|| (employee.role === 'bellhop' && employee.name.trim().toLowerCase() === 'bob' ? 'Robert Hayes' : null);
				if (replacementName) employee.name = replacementName;
			}
			for (const defaultEmployee of defaults.employees) {
				if (!normalized.employees.some((employee) => employee.name === defaultEmployee.name && employee.role === defaultEmployee.role)) normalized.employees.push(cloneState(defaultEmployee));
			}
		}
		normalized.employees.forEach((employee, index) => {
			const defaultSalary = defaults.employees.find((defaultEmployee) => defaultEmployee.name === employee.name)?.salary;
			if (employee.salary == null || !Number.isFinite(Number(employee.salary))) employee.salary = defaultSalary ?? salaryDefaults[employee.role] ?? null;
			employee.status = employee.status || 'active';
			employee.id = employee.id || `${hotelId.toUpperCase()}-EMP-${String(index + 1).padStart(3, '0')}`;
		});
		normalized.breakfast = savedState?.breakfast || cloneState(defaults.breakfast);
		normalized.pool = savedState?.pool || cloneState(defaults.pool);
		normalized.tickets = Array.isArray(savedState?.tickets) ? savedState.tickets : cloneState(defaults.tickets);
		normalized.currentUser = null;
		normalized.view = savedState?.view || 'overview';
		normalized.configTab = ['property', 'rooms', 'services'].includes(savedState?.configTab) ? savedState.configTab : 'property';
		normalized.reservationFilter = savedState?.reservationFilter || 'all';
		return normalized;
	};
	let legacyMoriohState = readStore('ellenjoe-hotel-state-v1', null);
	let currentHotelId = null;
	const hotelStorageKey = (hotelId) => `ellenjoe-hotel-manager-${hotelId}-v1`;
	const loadHotelState = (hotelId) => normalizeHotelState(
		readStore(hotelStorageKey(hotelId), hotelId === 'morioh' ? legacyMoriohState : null),
		hotelId
	);
	let state = loadHotelState('morioh');
	const page = document.querySelector('#page-content');
	const loginScreen = document.querySelector('#login-screen');
	const hotelSelectScreen = document.querySelector('#hotel-select-screen');
	const hotelChoiceGrid = document.querySelector('#hotel-choice-grid');
	const resetDefaultDescription = document.querySelector('#reset-default-description');
	const addHotelDialog = document.querySelector('#add-hotel-dialog');
	const addHotelForm = document.querySelector('#add-hotel-form');
	const hotelBackButton = document.querySelector('#back-to-hotels');
	const appShell = document.querySelector('#app-shell');
	const rolePicker = document.querySelector('#role-picker');
	const propertyBrand = document.querySelector('#property-brand-name');
	const loginTitle = document.querySelector('#login-title');
	const loginSubtitle = document.querySelector('#login-subtitle');
	const profileName = document.querySelector('#profile-name');
	const profileRole = document.querySelector('#profile-role');
	const dialog = document.querySelector('#booking-dialog');
	const bookingForm = document.querySelector('#booking-form');
	const roomDialog = document.querySelector('#room-dialog');
	const roomForm = document.querySelector('#room-form');
	const employeeDialog = document.querySelector('#employee-dialog');
	const employeeForm = document.querySelector('#employee-form');
	const resetDefaultDialog = document.querySelector('#reset-default-dialog');
	const ROLE_LABELS = {
		admin: { title: 'Admin', description: 'Hotel setup, rooms and service options', nav: ['settings'] },
		manager: { title: 'Manager', description: 'Hotel operations, guest stays and team management', nav: ['overview', 'reservations', 'rooms', 'guests', 'housekeeping', 'reports', 'employees'] },
		frontdesk: { title: 'Front desk', description: 'Check-ins, bookings and guest complaints', nav: ['overview', 'reservations', 'rooms', 'guests', 'requests'] },
		hr: { title: 'HR', description: 'Employee roster and salaries', nav: ['employees'] },
		support: { title: 'Customer support', description: 'Guest issue escalation and customer care', nav: ['support', 'reports'] },
		cleaner: { title: 'Cleaner', description: 'Assigned cleaning tasks and issue reporting', nav: ['tasks', 'requests'] },
		cleaner2: { title: 'Cleaner', description: 'Assigned cleaning tasks and issue reporting', nav: ['tasks', 'requests'] },
		cook: { title: 'Cook', description: 'Breakfast prep and kitchen service', nav: ['breakfast'] },
		lifeguard: { title: 'Lifeguard', description: 'Pool safety and guest monitoring', nav: ['pool'] },
		valet: { title: 'Valet', description: 'Coordinate guest arrivals and vehicle requests', nav: ['requests'] },
		security: { title: 'Security', description: 'Monitor hotel operations and report safety concerns', nav: ['requests'] },
		bellhop: { title: 'Bellhop', description: 'Assist arriving guests and support their stay', nav: ['requests'] },
		roomservice: { title: 'Room service attendant', description: 'Coordinate in-room guest service requests', nav: ['requests'] }
	};
	const SALARY_GUIDE = { admin: 75000, manager: 68000, cleaner: 42000, cleaner2: 42000, cook: 46000, lifeguard: 39000, frontdesk: 44000, hr: 58000, support: 44000, valet: 36000, security: 42000, bellhop: 34000, roomservice: 36000 };
	const REQUESTING_STAFF_ROLES = ['valet', 'security', 'bellhop', 'roomservice'];
	const getAvailableEmployeeRoles = () => Object.entries(ROLE_LABELS).filter(([role]) => role !== 'admin');
	const populateEmployeeRoleSelect = () => {
		const roleSelect = employeeForm.querySelector('[name="employee-role"]');
		const placeholder = document.createElement('option');
		placeholder.value = '';
		placeholder.textContent = 'Choose a role';
		placeholder.disabled = true;
		placeholder.selected = true;
		roleSelect.replaceChildren(placeholder);
		getAvailableEmployeeRoles().forEach(([role, meta]) => {
			const option = document.createElement('option');
			option.value = role;
			option.textContent = meta.title;
			roleSelect.append(option);
		});
		return roleSelect;
	};
	state.employees.forEach((employee, index) => {
		employee.id = employee.id || `EMP-${String(index + 1).padStart(3, '0')}`;
	});
	const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
	const saveState = () => {
		if (!currentHotelId) return;
		localStorage.setItem(hotelStorageKey(currentHotelId), JSON.stringify(state));
	};
	saveState();
	const statusLabel = (status) => ({ 'checked-in': 'Checked in', 'checked-out': 'Checked out', confirmed: 'Confirmed', cancelled: 'Cancelled' })[status] || status;
	const housekeepingLabel = (status) => ({ clean: 'Clean', dirty: 'Needs cleaning', cleaning: 'In progress', inspected: 'Inspected' })[status] || status;
	const initials = (name = '') => name.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
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
	const activeBookings = () => state.bookings.filter((booking) => ['confirmed', 'checked-in'].includes(booking.status));
	const bookingForRoomToday = (roomNumber) => activeBookings().find((booking) => booking.room === roomNumber && booking.checkin <= isoDate(today) && booking.checkout > isoDate(today));
	const getRoomAvailability = (room, checkin, checkout) => {
		const conflict = activeBookings().some((booking) => booking.room === room.number && booking.checkin < checkout && booking.checkout > checkin);
		return !conflict;
	};
	const updateReservationCount = () => {
		const countEl = document.querySelector('#reservation-count');
		if (countEl) countEl.textContent = state.bookings.filter((booking) => booking.status === 'confirmed').length;
	};
	const pageHeading = (eyebrow, title, description, actions = '') => `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><div class="heading-actions">${actions}</div></div>`;
	const reservationRows = (bookings) => bookings.map((booking) => {
		const action = booking.status === 'confirmed'
			? `<div class="row-actions"><button class="row-action" data-action="check-in" data-id="${escapeHtml(booking.id)}">Check in</button><button class="row-action row-cancel" data-action="cancel" data-id="${escapeHtml(booking.id)}">Cancel</button></div>`
			: booking.status === 'checked-in'
				? `<button class="row-action" data-action="check-out" data-id="${escapeHtml(booking.id)}">Check out</button>`
				: '';
		return `<tr><td><span class="booking-id">${escapeHtml(booking.id)}</span></td><td><div class="guest-cell"><span class="avatar avatar-soft">${escapeHtml(initials(booking.guest))}</span><span><strong>${escapeHtml(booking.guest)}</strong></span></div></td><td><span class="room-number">${escapeHtml(booking.room)}</span></td><td>${formatDate(booking.checkin)} <span class="date-arrow">→</span> ${formatDate(booking.checkout)}</td><td>${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}</td><td><span class="status-pill status-${escapeHtml(booking.status)}"><span></span>${statusLabel(booking.status)}</span></td><td class="row-action-cell">${action || '<span class="muted-dash">—</span>'}</td></tr>`;
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
		const guest = status.booking
			? `<div class="room-guest">${icon('user-round')} ${escapeHtml(status.booking.guest)}</div>`
			: `<div class="room-guest room-guest-muted">${escapeHtml(room.assignedCleaner ? `Assigned to ${room.assignedCleaner}` : 'Unassigned')}</div>`;
		const task = ['dirty', 'cleaning'].includes(room.housekeeping) && !status.booking
			? `<button class="room-task" data-action="clean-room" data-room="${escapeHtml(room.number)}">${room.housekeeping === 'dirty' ? 'Start clean' : 'Mark clean'} ${icon('arrow-right')}</button>`
			: `<span class="room-rate">$${room.rate} <small>/ night</small></span>`;
		return `<article class="room-card"><div class="room-card-top"><span class="room-number-large">${escapeHtml(room.number)}</span><span class="room-status status-room-${status.key}"><span></span>${status.label}</span></div><div class="room-type">${escapeHtml(room.type)} <span>·</span> ${escapeHtml(room.floor)}</div>${guest}<div class="room-card-bottom">${task}</div></article>`;
	}).join('');
	const button = (label, iconName, extra = '') => `<button class="button button-primary ${extra}" data-action="new-booking">${icon(iconName)} ${label}</button>`;
	const renderHotelSelect = () => {
		const hotelOptions = getHotelOptions();
		hotelChoiceGrid.innerHTML = hotelOptions.map((hotel) => `<button class="hotel-choice hotel-choice-${hotel.id}" type="button" data-hotel="${escapeHtml(hotel.id)}"><span class="hotel-choice-icon">${icon(hotel.icon)}</span><span class="hotel-choice-copy"><strong>${escapeHtml(hotel.name)}</strong><small>${escapeHtml(hotel.description)}</small></span>${icon('arrow-right', 'hotel-choice-arrow')}</button>`).join('');
		resetDefaultDescription.textContent = `This will erase saved changes for all ${hotelOptions.length} hotel workspaces, including rooms, bookings, staff, salaries, and service settings. This cannot be undone.`;
		hotelSelectScreen.hidden = false;
		loginScreen.hidden = true;
		appShell.hidden = true;
		document.title = `${APP_NAME} | Choose a Hotel`;
		refreshIcons();
	};
	const renderLoginScreen = () => {
		const visibleRoles = Object.entries(ROLE_LABELS).filter(([role]) => {
			if (role === 'cook' && !state.config.features.continentalBreakfast) return false;
			if (role === 'lifeguard' && !state.config.features.pool) return false;
			return true;
		}).flatMap(([role, meta]) => {
			const roleEmployees = state.employees.filter((employee) => employee.role === role);
			const employees = roleEmployees.filter((employee) => employee.status !== 'terminated');
			return employees.map((employee) => ({ role, meta, name: employee.name }));
		});
		rolePicker.innerHTML = visibleRoles.map(({ role, meta, name }) => `
			<button class="role-option ${role}" type="button" data-role="${role}" data-name="${escapeHtml(name)}">
				<div class="role-user">${escapeHtml(name)}</div>
				<div class="role-name"><span>${meta.title}</span><span>${icon('arrow-right')}</span></div>
				<div class="role-text">${escapeHtml(meta.description)}</div>
			</button>
		`).join('');
		if (!rolePicker.innerHTML.trim()) {
			rolePicker.innerHTML = '<div class="panel empty-list"><h2>Features disabled</h2><p>Turn on breakfast or pool support in admin settings to make roles available.</p></div>';
		}
		loginTitle.textContent = `Welcome to ${state.config.hotelName}`;
		loginSubtitle.textContent = `Select your role to enter ${state.config.hotelName}.`;
		hotelSelectScreen.hidden = true;
		hotelBackButton.hidden = false;
		loginScreen.hidden = false;
		appShell.hidden = true;
		document.title = `${APP_NAME} | ${state.config.hotelName}`;
	};
	const updateProfile = () => {
		const userName = state.currentUser.name;
		const roleName = ROLE_LABELS[state.currentUser.role]?.title || state.currentUser.role;
		if (propertyBrand) propertyBrand.textContent = state.config.hotelName;
		const breadcrumbProperty = document.querySelector('#breadcrumb-property');
		const bookingPropertyName = document.querySelector('#booking-property-name');
		if (breadcrumbProperty) breadcrumbProperty.textContent = state.config.hotelName;
		if (bookingPropertyName) bookingPropertyName.textContent = state.config.hotelName.toUpperCase();
		if (loginTitle) loginTitle.textContent = `Welcome to ${state.config.hotelName}`;
		if (loginSubtitle) loginSubtitle.textContent = `Select your role to enter ${state.config.hotelName}.`;
		document.title = `${APP_NAME} | ${state.config.hotelName}`;
		profileName.textContent = userName;
		profileRole.textContent = roleName;
	};
	const getRoleNav = () => (state.currentUser ? ROLE_LABELS[state.currentUser.role]?.nav || ['overview'] : ['overview']);
	const applyNavVisibility = () => {
		const allowed = new Set(getRoleNav());
		const navGroups = document.querySelectorAll('.primary-nav');
		document.querySelectorAll('.nav-item').forEach((item) => {
			let visible = allowed.has(item.dataset.view);
			if (item.dataset.view === 'breakfast' && !state.config.features.continentalBreakfast) visible = false;
			if (item.dataset.view === 'pool' && !state.config.features.pool) visible = false;
			item.hidden = !visible;
			item.classList.toggle('active', item.dataset.view === state.view);
		});
		navGroups.forEach((nav) => {
			const visibleItems = [...nav.querySelectorAll('.nav-item')].some((item) => !item.hidden);
			nav.hidden = !visibleItems;
		});
		const labels = document.querySelectorAll('.nav-label');
		labels[0] && (labels[0].hidden = navGroups[0]?.hidden);
		labels[1] && (labels[1].hidden = navGroups[1]?.hidden);
		const secondaryLabel = document.querySelector('#secondary-nav-label');
		if (secondaryLabel && state.currentUser?.role === 'admin') secondaryLabel.textContent = 'CONFIGURATION';
	};
	const assignCleanerToRoom = (roomNumber) => {
		const room = state.rooms.find((item) => item.number === roomNumber);
		if (!room) return;
		const options = state.employees.filter((employee) => ['cleaner', 'cleaner2'].includes(employee.role)).map((employee) => employee.name);
		if (!options.length) return toast('Add a cleaner in the employee roster first.', 'users-round');
		const chosen = window.prompt(`Assign the cleaner for room ${roomNumber}. Choose: ${options.join(', ')}`, room.assignedCleaner || options[0]);
		if (!chosen) return;
		room.assignedCleaner = options.includes(chosen) ? chosen : options[0];
		saveState();
		render();
		toast(`Room ${roomNumber} assigned to ${room.assignedCleaner}.`, 'sparkles');
	};
	const cycleHousekeeping = (room) => {
		const order = ['dirty', 'cleaning', 'clean', 'inspected'];
		const current = order.indexOf(room.housekeeping);
		room.housekeeping = order[(current + 1) % order.length];
	};
	const renderOverview = () => {
		const todayBookings = state.bookings.filter((booking) => booking.checkin === isoDate(today) && ['confirmed', 'checked-in'].includes(booking.status));
		const arrivals = todayBookings.filter((booking) => booking.status === 'confirmed');
		const occupied = state.rooms.filter((room) => bookingForRoomToday(room.number)?.status === 'checked-in').length;
		const departures = state.bookings.filter((booking) => booking.checkout === isoDate(today) && booking.status === 'checked-in').length;
		const occupancy = state.rooms.length ? Math.round((occupied / state.rooms.length) * 100) : 0;
		const revenue = state.bookings.filter((booking) => booking.status === 'checked-in' || (booking.status === 'confirmed' && booking.checkin === isoDate(today))).reduce((sum, booking) => sum + (state.rooms.find((room) => room.number === booking.room)?.rate || 0), 0);
		const nextArrivals = arrivals.slice(0, 5);
		const breakfastStatus = state.breakfast.active ? 'Service live' : 'Prep mode';
		const breakfastPanel = state.config.features.continentalBreakfast ? `
			<section class="panel breakfast-panel">
				<div class="panel-heading"><div><h2>Continental breakfast at 7:00</h2><p>${breakfastStatus} · ${state.breakfast.cooks.length} cooks assigned</p></div><button class="button button-outline" data-action="toggle-breakfast">${state.breakfast.active ? 'Pause service' : 'Start service'}</button></div>
				<div class="breakfast-body">
					<div class="breakfast-meta"><span>Cook team</span><strong>${state.breakfast.cooks.join(' + ')}</strong></div>
					<div class="breakfast-menu">${state.breakfast.menu.map((item) => `<span>${item}</span>`).join('')}</div>
				</div>
			</section>` : '';
		return `${pageHeading(formatDate(isoDate(today), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(), 'Good morning, ' + state.currentUser.name.split(' ')[0], `Here is what is happening at ${escapeHtml(state.config.hotelName)} today.`, button('New reservation', 'plus'))}
			<div class="metric-grid">
				<article class="metric-card"><div class="metric-top"><span>Occupancy</span><span class="metric-icon metric-icon-green">${icon('door-open')}</span></div><div class="metric-value">${occupancy}<small>%</small></div><div class="metric-foot"><span class="trend-up">${occupied} rooms occupied</span><span>of ${state.rooms.length} rooms</span></div><div class="metric-progress"><span style="width:${occupancy}%"></span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Arrivals today</span><span class="metric-icon metric-icon-blue">${icon('log-in')}</span></div><div class="metric-value">${arrivals.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span class="trend-neutral">${arrivals.filter((item) => item.status === 'confirmed').length} expected</span><span>across ${new Set(arrivals.map((item) => item.room)).size} rooms</span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Departures</span><span class="metric-icon metric-icon-amber">${icon('log-out')}</span></div><div class="metric-value">${departures.toString().padStart(2, '0')}</div><div class="metric-foot"><span class="trend-neutral">${departures ? 'Before 11:00 AM' : 'No check-outs due'}</span><span>today</span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Room revenue</span><span class="metric-icon metric-icon-coral">${icon('wallet')}</span></div><div class="metric-value metric-currency">$${revenue.toLocaleString('en-US')}</div><div class="metric-foot"><span class="trend-up">Today so far</span><span>room revenue</span></div></article>
			</div>
			<div class="dashboard-grid">
				<section class="panel arrivals-panel"><div class="panel-heading"><div><h2>Today's arrivals</h2><p>${arrivals.length} guests checking in</p></div><button class="subtle-link" data-view="reservations">All reservations ${icon('arrow-up-right')}</button></div>${reservationTable(nextArrivals, true)}</section>
				<section class="panel activity-panel"><div class="panel-heading"><div><h2>At a glance</h2><p>Property pulse for today</p></div></div>
					<div class="pulse-row"><span class="pulse-icon pulse-green">${icon('bed-double')}</span><span><strong>${state.rooms.filter((room) => roomState(room).key === 'available').length} rooms ready</strong><small>Clean and available to sell</small></span></div>
					<div class="pulse-row"><span class="pulse-icon pulse-amber">${icon('sparkles')}</span><span><strong>${state.rooms.filter((room) => ['dirty', 'cleaning'].includes(room.housekeeping)).length} rooms need attention</strong><small>Housekeeping tasks outstanding</small></span></div>
					<div class="occupancy-mini"><div class="occupancy-copy"><span>Room occupancy</span><strong>${occupancy}%</strong></div><div class="mini-bars">${state.rooms.map((room) => `<span class="mini-bar ${roomState(room).key === 'occupied' ? 'bar-filled' : roomState(room).key === 'reserved' ? 'bar-reserved' : ''}"></span>`).join('')}</div><div class="legend"><span><i class="legend-occupied"></i>Occupied</span><span><i class="legend-reserved"></i>Reserved</span><span><i class="legend-open"></i>Available</span></div></div>
				</section>
			</div>
			${breakfastPanel}
			<section class="panel room-board-panel"><div class="panel-heading"><div><h2>Room board</h2><p>Live status across the property</p></div><button class="subtle-link" data-view="rooms">Open room board ${icon('arrow-up-right')}</button></div><div class="room-grid room-grid-preview">${roomCards(state.rooms.slice(0, 4))}</div></section>`;
	};
	const renderFrontDeskOverview = () => {
		const todayBookings = state.bookings.filter((booking) => booking.checkin === isoDate(today) && ['confirmed', 'checked-in'].includes(booking.status));
		const arrivals = todayBookings.filter((booking) => booking.status === 'confirmed');
		const inHouse = state.bookings.filter((booking) => booking.status === 'checked-in').length;
		const departures = state.bookings.filter((booking) => booking.checkout === isoDate(today) && booking.status === 'checked-in').length;
		return `${pageHeading(formatDate(isoDate(today), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(), `Welcome, ${escapeHtml(state.currentUser.name.split(' ')[0])}`, 'Your arrivals, departures, and guest requests for today.', button('New reservation', 'plus'))}
			<div class="metric-grid frontdesk-metrics"><article class="metric-card"><div class="metric-top"><span>Arrivals today</span><span class="metric-icon metric-icon-blue">${icon('log-in')}</span></div><div class="metric-value">${arrivals.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Waiting to check in</span><span>today</span></div></article><article class="metric-card"><div class="metric-top"><span>Departures today</span><span class="metric-icon metric-icon-amber">${icon('log-out')}</span></div><div class="metric-value">${departures.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Ready for check-out</span><span>today</span></div></article><article class="metric-card"><div class="metric-top"><span>Guests in house</span><span class="metric-icon metric-icon-green">${icon('users-round')}</span></div><div class="metric-value">${inHouse.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Active stays</span><span>currently</span></div></article></div>
			<section class="panel arrivals-panel"><div class="panel-heading"><div><h2>Today's arrivals</h2><p>${arrivals.length} reservations to check in</p></div><button class="subtle-link" data-view="reservations">All reservations ${icon('arrow-up-right')}</button></div>${reservationTable(arrivals.slice(0, 8), true)}</section>
			<section class="panel request-shortcut"><div><span class="metric-icon metric-icon-coral">${icon('message-square-warning')}</span><span><strong>Guest complaint or issue?</strong><small>Send it to the support team for follow-up.</small></span></div><button class="button button-outline" data-view="requests">Report issue ${icon('arrow-right')}</button></section>`;
	};
	const renderReservations = () => {
		let bookings = [...state.bookings];
		if (state.reservationFilter !== 'all') bookings = bookings.filter((booking) => booking.status === state.reservationFilter);
		bookings = bookings.sort((first, second) => first.checkin.localeCompare(second.checkin));
		const filters = [['all', 'All stays'], ['confirmed', 'Confirmed'], ['checked-in', 'In house'], ['checked-out', 'Checked out']];
		const headingAction = state.rooms.length ? button('New reservation', 'plus') : `<button class="button button-primary" data-action="add-room">${icon('plus')} Add a room</button>`;
		const content = state.bookings.length
			? `<section class="panel full-panel"><div class="list-toolbar"><div class="filter-tabs">${filters.map(([value, label]) => `<button class="filter-tab ${state.reservationFilter === value ? 'selected' : ''}" data-filter="${value}">${label}${value === 'all' ? `<span>${state.bookings.length}</span>` : ''}</button>`).join('')}</div><button class="button button-outline" data-action="export-bookings">${icon('download')} Export</button></div>${reservationTable(bookings)}</section>`
			: `<section class="panel empty-list"><span class="empty-icon empty-icon-coral">${icon('calendar-plus')}</span><h2>No stays on the books yet</h2><p>${state.rooms.length ? 'Your first guest is just a reservation away.' : 'Add a room first, then start taking reservations.'}</p><button class="button button-primary" data-action="${state.rooms.length ? 'new-booking' : 'add-room'}">${icon(state.rooms.length ? 'plus' : 'bed-double')} ${state.rooms.length ? 'Create first reservation' : 'Set up rooms'}</button></section>`;
		return `${pageHeading('FRONT DESK', 'Reservations', 'Manage stays, arrivals, and departures.', headingAction)}${content}`;
	};
	const renderRooms = () => {
		const available = state.rooms.filter((room) => roomState(room).key === 'available').length;
		const occupied = state.rooms.filter((room) => roomState(room).key === 'occupied').length;
		const needsAttention = state.rooms.filter((room) => ['dirty', 'cleaning'].includes(room.housekeeping)).length;
		let roomContent = state.rooms.map((room) => {
			const status = roomState(room);
			const guest = status.booking ? `<div class="room-guest">${icon('user-round')} ${escapeHtml(status.booking.guest)}</div>` : `<div class="room-guest room-guest-muted">${escapeHtml(room.assignedCleaner ? `Assigned to ${room.assignedCleaner}` : 'Unassigned')}</div>`;
			const assignAction = state.currentUser && ['admin', 'manager'].includes(state.currentUser.role) ? `<button class="row-action" data-action="assign-room" data-room="${escapeHtml(room.number)}">${room.assignedCleaner ? 'Reassign' : 'Assign'} cleaner</button>` : '';
			const rateTag = state.currentUser && state.currentUser.role !== 'cleaner' ? `<span class="room-rate">$${room.rate} <small>/ night</small></span>` : '';
			return `<article class="room-card"><div class="room-card-top"><span class="room-number-large">${escapeHtml(room.number)}</span><span class="room-status status-room-${status.key}"><span></span>${status.label}</span></div><div class="room-type">${escapeHtml(room.type)} <span>·</span> ${escapeHtml(room.floor)}</div>${guest}<div class="room-card-bottom">${assignAction}${rateTag}</div></article>`;
		}).join('');
		if (!roomContent) roomContent = `<div class="panel empty-list room-empty"><span class="empty-icon empty-icon-green">${icon('bed-double')}</span><h2>Your room board is blank</h2><p>Add your first room to begin tracking availability and arrivals.</p><button class="button button-primary" data-action="add-room">${icon('plus')} Add your first room</button></div>`;
		return `${pageHeading('PROPERTY', 'Room board', `A live view of every room at ${escapeHtml(state.config.hotelName)}.`, `<button class="button button-primary" data-action="add-room">${icon('plus')} Add room</button>`)}
			<div class="room-summary"><div><span class="summary-dot dot-green"></span><strong>${available}</strong> available</div><div><span class="summary-dot dot-blue"></span><strong>${occupied}</strong> occupied</div><div><span class="summary-dot dot-amber"></span><strong>${needsAttention}</strong> need attention</div></div>
			<div class="floor-heading"><h2>All rooms</h2><span>${state.rooms.length} ${state.rooms.length === 1 ? 'key' : 'keys'}</span></div><div class="room-grid room-grid-full">${roomContent}</div>`;
	};
	const getGuests = () => {
		const guests = new Map();
		state.bookings.forEach((booking) => {
			const key = booking.guest.trim().toLocaleLowerCase();
			const guest = guests.get(key) || { ...booking, stays: 0, lastStay: booking.checkin };
			guest.stays += 1;
			if (booking.checkin > guest.lastStay) guest.lastStay = booking.checkin;
			guests.set(key, guest);
		});
		return [...guests.values()].sort((first, second) => first.guest.localeCompare(second.guest));
	};
	const renderGuests = () => {
		const guests = getGuests();
		const rows = guests.map((guest) => `<tr><td><div class="guest-cell"><span class="avatar avatar-soft">${escapeHtml(initials(guest.guest))}</span><span><strong>${escapeHtml(guest.guest)}</strong></span></div></td><td>${guest.stays} ${guest.stays === 1 ? 'stay' : 'stays'}</td><td>${formatDate(guest.lastStay, { month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>`).join('');
		return `${pageHeading('RELATIONSHIPS', 'Guests', 'Get to know the people who make your hotel special.')}
			<div class="metric-grid guest-metrics"><article class="metric-card"><div class="metric-top"><span>Total guests</span><span class="metric-icon metric-icon-green">${icon('users-round')}</span></div><div class="metric-value">${guests.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Guest profiles</span><span>on file</span></div></article><article class="metric-card"><div class="metric-top"><span>Returning guests</span><span class="metric-icon metric-icon-blue">${icon('repeat-2')}</span></div><div class="metric-value">${guests.filter((guest) => guest.stays > 1).length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>More than one stay</span><span>this season</span></div></article></div>
			<section class="panel full-panel"><div class="panel-heading"><div><h2>Guest directory</h2><p>Guest history from reservations</p></div><span class="record-count">${guests.length} records</span></div><div class="table-scroll"><table class="data-table guest-table"><thead><tr><th>GUEST</th><th>STAYS</th><th>LAST BOOKING</th></tr></thead><tbody>${rows || '<tr><td class="empty-cell" colspan="3">No guests found.</td></tr>'}</tbody></table></div></section>`;
	};
	const renderHousekeeping = () => {
		const rooms = state.rooms;
		const counts = ['dirty', 'cleaning', 'clean', 'inspected'].map((status) => [status, state.rooms.filter((room) => room.housekeeping === status).length]);
		const housekeepingRows = rooms.map((room) => {
			const action = room.housekeeping === 'dirty' ? 'Start cleaning' : room.housekeeping === 'cleaning' ? 'Mark clean' : room.housekeeping === 'clean' ? 'Inspect room' : 'Mark needs cleaning';
			return `<tr><td><span class="room-number">${escapeHtml(room.number)}</span></td><td>${escapeHtml(room.type)}</td><td>${room.assignedCleaner ? escapeHtml(room.assignedCleaner) : '<span class="muted-dash">Unassigned</span>'}</td><td><span class="housekeeping-pill house-${room.housekeeping}"><span></span>${housekeepingLabel(room.housekeeping)}</span></td><td><button class="row-action" data-action="cycle-housekeeping" data-room="${escapeHtml(room.number)}">${action}</button></td></tr>`;
		}).join('');
		return `${pageHeading('ROOM OPERATIONS', 'Housekeeping', 'Keep every room guest-ready, one task at a time.')}
			<div class="housekeeping-stats">${counts.map(([status, count]) => `<div><span class="housekeeping-pill house-${status}"><span></span>${housekeepingLabel(status)}</span><strong>${count}</strong></div>`).join('')}</div>
			<section class="panel full-panel"><div class="panel-heading"><div><h2>Room tasks</h2><p>Update room status as work is completed</p></div></div>${rooms.length ? `<div class="table-scroll"><table class="data-table housekeeping-table"><thead><tr><th>ROOM</th><th>ROOM TYPE</th><th>CLEANER</th><th>STATUS</th><th></th></tr></thead><tbody>${housekeepingRows}</tbody></table></div>` : '<p class="empty-inline">No rooms to tidy yet. Add a room to start housekeeping.</p>'}</section>`;
	};
	const renderReports = () => {
		const occupied = state.rooms.filter((room) => bookingForRoomToday(room.number)?.status === 'checked-in').length;
		const occupancy = state.rooms.length ? Math.round((occupied / state.rooms.length) * 100) : 0;
		const active = activeBookings();
		const averageRate = active.length ? Math.round(active.reduce((sum, booking) => sum + (state.rooms.find((room) => room.number === booking.room)?.rate || 0), 0) / active.length) : 0;
		const revenue = active.reduce((sum, booking) => sum + (state.rooms.find((room) => room.number === booking.room)?.rate || 0), 0);
		const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const values = state.bookings.length ? [38, 55, 48, 73, 62, 91, occupancy || 14] : [0, 0, 0, 0, 0, 0, 0];
		return `${pageHeading('INSIGHTS', 'Reports', 'A snapshot of how your property is performing.')}
			<div class="metric-grid"><article class="metric-card"><div class="metric-top"><span>Occupancy today</span>${icon('chart-no-axes-combined', 'metric-plain-icon')}</div><div class="metric-value">${occupancy}<small>%</small></div><div class="metric-foot"><span>Based on checked-in rooms</span><span>${state.rooms.length} keys</span></div></article><article class="metric-card"><div class="metric-top"><span>Average daily rate</span>${icon('badge-dollar-sign', 'metric-plain-icon')}</div><div class="metric-value metric-currency">$${averageRate}</div><div class="metric-foot"><span>For active reservations</span><span>per night</span></div></article><article class="metric-card"><div class="metric-top"><span>Room revenue</span>${icon('wallet', 'metric-plain-icon')}</div><div class="metric-value metric-currency">$${revenue.toLocaleString('en-US')}</div><div class="metric-foot"><span>Active stay value</span><span>per night</span></div></article><article class="metric-card"><div class="metric-top"><span>Confirmed stays</span>${icon('calendar-check-2', 'metric-plain-icon')}</div><div class="metric-value">${state.bookings.filter((booking) => booking.status === 'confirmed').length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Upcoming reservations</span><span>on the books</span></div></article></div>
			<div class="report-grid"><section class="panel report-panel"><div class="panel-heading"><div><h2>Occupancy trend</h2><p>Daily room occupancy · this week</p></div><span class="report-period">This week ${icon('chevron-down')}</span></div><div class="chart-wrap"><div class="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div class="chart-area"><div class="chart-grid-lines"><i></i><i></i><i></i><i></i><i></i></div><div class="chart-bars">${week.map((day, index) => `<div class="chart-day"><div class="chart-bar-column"><span class="chart-bar ${index === 6 ? 'chart-bar-today' : ''}" style="height:${values[index]}%" title="${values[index]}%"></span></div><span>${day}</span></div>`).join('')}</div></div></div></section><section class="panel report-panel mix-panel"><div class="panel-heading"><div><h2>Room mix</h2><p>Inventory by room type</p></div></div><div class="mix-list">${[...new Set(state.rooms.map((room) => room.type))].map((type, index) => { const count = state.rooms.filter((room) => room.type === type).length; const colors = ['mix-green', 'mix-blue', 'mix-amber', 'mix-coral']; return `<div class="mix-item"><span class="mix-dot ${colors[index % colors.length]}"></span><span>${escapeHtml(type)}</span><strong>${count}</strong><div class="mix-track"><i class="${colors[index % colors.length]}" style="width:${(count / Math.max(state.rooms.length, 1)) * 100}%"></i></div></div>`; }).join('')}</div></section></div>`;
	};
	const renderSettings = () => {
		const roomRows = state.rooms.map((room) => `<tr class="config-room-row" data-action="edit-room" data-room="${escapeHtml(room.number)}" tabindex="0" aria-label="Edit room ${escapeHtml(room.number)}"><td><button class="config-room-link" type="button">${escapeHtml(room.number)}</button></td><td>${escapeHtml(room.type)}</td><td>${escapeHtml(room.floor)}</td><td>$${Number(room.rate).toLocaleString('en-US')}</td></tr>`).join('');
		const tabs = [['property', 'Property'], ['rooms', 'Rooms'], ['services', 'Services']];
		let panel = '';
		if (state.configTab === 'rooms') {
			panel = `<section class="settings-tab-panel" role="tabpanel"><div class="settings-panel-heading"><div><h2>Room inventory</h2><p>${state.rooms.length} ${state.rooms.length === 1 ? 'room' : 'rooms'} configured for this property</p></div><button class="button button-primary" data-action="add-room">${icon('plus')} Add room</button></div><div class="table-scroll"><table class="data-table"><thead><tr><th>ROOM</th><th>TYPE</th><th>FLOOR</th><th>RATE / NIGHT</th></tr></thead><tbody>${roomRows || '<tr><td class="empty-cell" colspan="4">No rooms configured.</td></tr>'}</tbody></table></div></section>`;
		} else if (state.configTab === 'services') {
			panel = `<section class="settings-tab-panel" role="tabpanel"><div class="settings-panel-heading"><div><h2>Hotel services</h2><p>Enable only the services this property provides</p></div></div><div class="service-settings"><label class="service-setting"><span class="service-setting-icon service-setting-breakfast">${icon('coffee')}</span><span class="service-setting-copy"><strong>Continental breakfast</strong><small>Breakfast service and cook access</small></span><input type="checkbox" id="feature-breakfast" ${state.config.features.continentalBreakfast ? 'checked' : ''}></label><label class="service-setting"><span class="service-setting-icon service-setting-pool">${icon('waves')}</span><span class="service-setting-copy"><strong>Pool and lifeguard service</strong><small>Pool operations and lifeguard access</small></span><input type="checkbox" id="feature-pool" ${state.config.features.pool ? 'checked' : ''}></label></div><button class="button button-primary" data-action="save-settings">${icon('check')} Save services</button></section>`;
		} else {
			panel = `<section class="settings-tab-panel" role="tabpanel"><div class="settings-panel-heading"><div><h2>Property details</h2><p>Identity shown throughout the hotel workspace</p></div></div><div class="settings-form"><label class="field">Hotel name<input value="${escapeHtml(state.config.hotelName)}" id="property-name"></label><label class="field">Location<input value="${escapeHtml(state.config.location)}" id="property-location"></label></div><button class="button button-primary" data-action="save-settings">${icon('check')} Save property details</button></section>`;
		}
		return `${pageHeading('ADMINISTRATION', 'Hotel configuration', 'Configure this property and its available services.')}
			<div class="settings-tabs" role="tablist" aria-label="Configuration sections">${tabs.map(([key, label]) => `<button class="settings-tab ${state.configTab === key ? 'selected' : ''}" type="button" role="tab" aria-selected="${state.configTab === key}" data-config-tab="${key}">${label}</button>`).join('')}</div>${panel}`;
	};
	const renderEmployees = () => {
		const rows = state.employees.map((employee) => {
			const protectedRole = ['admin', 'manager'].includes(employee.role);
			const status = employee.status || 'active';
			const employmentAction = protectedRole ? '<span class="protected-employee">Protected</span>' : `<button class="row-action ${status === 'active' ? 'row-cancel' : ''}" data-action="${status === 'active' ? 'fire-employee' : 'rehire-employee'}" data-employee-id="${escapeHtml(employee.id)}">${status === 'active' ? 'Fire' : 'Rehire'}</button>`;
			return `<tr><td><div class="guest-cell"><span class="avatar avatar-soft">${escapeHtml(initials(employee.name))}</span><span><strong>${escapeHtml(employee.name)}</strong></span></div></td><td>${escapeHtml(ROLE_LABELS[employee.role]?.title || employee.role)}</td><td>$${Number(employee.salary || 0).toLocaleString('en-US')}</td><td><span class="status-pill status-${status === 'active' ? 'confirmed' : 'cancelled'}"><span></span>${status === 'active' ? 'Active' : 'Fired'}</span></td><td><button class="row-action" data-action="edit-salary" data-employee-id="${escapeHtml(employee.id)}">Edit salary</button></td><td>${employmentAction}</td></tr>`;
		}).join('');
		const activeCount = state.employees.filter((employee) => employee.status !== 'terminated').length;
		return `${pageHeading('HUMAN RESOURCES', 'Employees & salaries', 'Manage the employee roster, annual salaries, and employment status.', `<button type="button" class="button button-primary" data-action="add-employee">${icon('plus')} Hire employee</button>`)}
			<section class="panel full-panel"><div class="panel-heading"><div><h2>Employee roster</h2><p>${activeCount} active · ${state.employees.length - activeCount} former</p></div></div><div class="table-scroll"><table class="data-table employee-table"><thead><tr><th>EMPLOYEE</th><th>ROLE</th><th>ANNUAL SALARY</th><th>STATUS</th><th></th><th></th></tr></thead><tbody>${rows || '<tr><td class="empty-cell" colspan="6">No employees yet.</td></tr>'}</tbody></table></div></section>`;
	};
	const renderPoolHub = () => `${pageHeading('POOL OPERATIONS', 'Pool safety', 'Monitor the water area, lifeguard coverage and guest safety.', `<button class="button button-primary" data-action="toggle-pool-open">${state.pool.open ? 'Close pool' : 'Reopen pool'}</button>`)}
		<section class="panel full-panel"><div class="panel-heading"><div><h2>Pool status</h2><p>Current conditions and service coverage</p></div><span class="status-pill ${state.pool.open ? 'status-confirmed' : 'status-checked-out'}"><span></span>${state.pool.open ? 'Open' : 'Closed'}</span></div><div class="metric-grid"><article class="metric-card"><div class="metric-top"><span>Water quality</span><span class="metric-icon metric-icon-blue">${icon('waves')}</span></div><div class="metric-value">Clear</div><div class="metric-foot"><span>Chlorine balanced</span><span>daily check</span></div></article><article class="metric-card"><div class="metric-top"><span>Guard coverage</span><span class="metric-icon metric-icon-green">${icon('shield-check')}</span></div><div class="metric-value">On duty</div><div class="metric-foot"><span>${escapeHtml(state.currentUser.name)}</span><span>current shift</span></div></article></div></section>`;
	const renderCleanerTasks = () => {
		const myRooms = state.rooms.filter((room) => room.assignedCleaner === state.currentUser.name);
		const rows = myRooms.map((room) => `<tr><td><span class="room-number">${escapeHtml(room.number)}</span></td><td>${escapeHtml(room.type)}</td><td><span class="housekeeping-pill house-${room.housekeeping}"><span></span>${housekeepingLabel(room.housekeeping)}</span></td><td>${room.housekeeping === 'dirty' ? 'Needs deep clean' : room.housekeeping === 'cleaning' ? 'In progress' : room.housekeeping === 'clean' ? 'Ready to inspect' : 'Ready for next guest'}</td><td><button class="row-action" data-action="cycle-housekeeping" data-room="${escapeHtml(room.number)}">Submit update</button></td></tr>`).join('');
		return `${pageHeading('HOUSEKEEPING', 'My tasks', 'Rooms assigned to you are saved and appear every time you sign in.')}
			<div class="metric-grid"><article class="metric-card"><div class="metric-top"><span>Assigned rooms</span><span class="metric-icon metric-icon-green">${icon('bed-double')}</span></div><div class="metric-value">${myRooms.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Waiting for service</span><span>today</span></div></article><article class="metric-card"><div class="metric-top"><span>Ready to inspect</span><span class="metric-icon metric-icon-blue">${icon('sparkles')}</span></div><div class="metric-value">${myRooms.filter((room) => room.housekeeping === 'clean' || room.housekeeping === 'inspected').length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Prepared for guest arrival</span><span>in the next shift</span></div></article></div>
			<section class="panel full-panel"><div class="panel-heading"><div><h2>Assigned room list</h2><p>These tasks stay synced to your account</p></div></div><div class="table-scroll"><table class="data-table housekeeping-table"><thead><tr><th>ROOM</th><th>TYPE</th><th>STATUS</th><th>NOTE</th><th></th></tr></thead><tbody>${rows || '<tr><td class="empty-cell" colspan="5">No rooms assigned to you yet.</td></tr>'}</tbody></table></div></section>`;
	};
	const renderRequests = () => {
		const isCleaner = ['cleaner', 'cleaner2'].includes(state.currentUser.role);
		const isRequestingStaff = REQUESTING_STAFF_ROLES.includes(state.currentUser.role);
		const staffCategories = {
			valet: ['Vehicle request', 'Arrival assistance', 'Other'],
			security: ['Safety concern', 'Security incident', 'Other'],
			bellhop: ['Luggage assistance', 'Guest arrival', 'Other'],
			roomservice: ['Room service request', 'Delivery issue', 'Other']
		};
		const categories = isCleaner
			? ['Room cleaning update', 'Room maintenance', 'Cleaning supplies', 'Other']
			: staffCategories[state.currentUser.role] || ['Guest complaint', 'Room issue', 'Booking question', 'Other'];
		const title = isCleaner || isRequestingStaff ? 'Report an issue' : 'Guest complaints';
		const description = isCleaner
			? 'Send a room or supply issue to the support team.'
			: isRequestingStaff
				? 'Send an operational update to the hotel support team.'
				: 'Record a guest complaint or service issue for follow-up.';
		const recent = state.tickets.filter((ticket) => (ticket.requester || ticket.guest) === state.currentUser.name).slice(0, 5);
		const rows = recent.map((ticket) => `<tr><td>${escapeHtml(ticket.id)}</td><td>${escapeHtml(ticket.issue)}</td><td><span class="status-pill status-${ticket.status === 'Open' ? 'checked-in' : 'confirmed'}"><span></span>${escapeHtml(ticket.status)}</span></td></tr>`).join('');
		return `${pageHeading(isCleaner ? 'HOUSEKEEPING' : isRequestingStaff ? 'HOTEL OPERATIONS' : 'FRONT DESK', title, description)}
			<section class="panel request-panel"><form id="request-form" class="request-form"><label class="field">Request type<select name="category" required>${categories.map((category) => `<option>${escapeHtml(category)}</option>`).join('')}</select></label><label class="field">Room<input name="room" maxlength="30" placeholder="Optional"></label><label class="field field-wide">Details<textarea name="details" required rows="4" placeholder="Describe the issue or complaint"></textarea></label><button class="button button-primary" type="submit">${icon('send')} Submit request</button></form></section>
			<section class="panel full-panel request-history"><div class="panel-heading"><div><h2>Recent requests</h2><p>Your latest submissions</p></div></div><div class="table-scroll"><table class="data-table"><thead><tr><th>REFERENCE</th><th>REQUEST</th><th>STATUS</th></tr></thead><tbody>${rows || '<tr><td class="empty-cell" colspan="3">No requests submitted yet.</td></tr>'}</tbody></table></div></section>`;
	};
	const renderSupportHub = () => {
		const openTickets = state.tickets.filter((ticket) => ticket.status === 'Open');
		const rows = state.tickets.map((ticket) => {
			const requester = ticket.requester || ticket.guest;
			return `<tr><td>${escapeHtml(ticket.id)}</td><td><div class="guest-cell"><span class="avatar avatar-soft">${escapeHtml(initials(requester))}</span><span><strong>${escapeHtml(requester)}</strong><small>${escapeHtml(ticket.room || 'No room specified')}</small></span></div></td><td>${escapeHtml(ticket.issue)}</td><td><span class="status-pill status-${ticket.priority === 'High' ? 'checked-in' : 'confirmed'}"><span></span>${escapeHtml(ticket.priority)}</span></td><td>${escapeHtml(ticket.status)}</td><td><button class="row-action" data-action="toggle-ticket" data-id="${escapeHtml(ticket.id)}">${ticket.status === 'Open' ? 'Resolve' : 'Reopen'}</button></td></tr>`;
		}).join('');
		return `${pageHeading('GUEST CARE', 'Support desk', 'Track current guest requests and resolve issues fast.')}
			<div class="metric-grid"><article class="metric-card"><div class="metric-top"><span>Open requests</span><span class="metric-icon metric-icon-coral">${icon('life-buoy')}</span></div><div class="metric-value">${openTickets.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Guest issues needing attention</span><span>today</span></div></article><article class="metric-card"><div class="metric-top"><span>Resolved</span><span class="metric-icon metric-icon-green">${icon('check-circle-2')}</span></div><div class="metric-value">${(state.tickets.length - openTickets.length).toString().padStart(2, '0')}</div><div class="metric-foot"><span>Tickets closed this week</span><span>with care</span></div></article></div>
			<section class="panel full-panel"><div class="panel-heading"><div><h2>Guest issues</h2><p>Support queue for ${escapeHtml(state.config.hotelName)}</p></div></div><div class="table-scroll"><table class="data-table"><thead><tr><th>TICKET</th><th>REQUESTER</th><th>ISSUE</th><th>PRIORITY</th><th>STATUS</th><th></th></tr></thead><tbody>${rows || '<tr><td class="empty-cell" colspan="6">No support tickets.</td></tr>'}</tbody></table></div></section>`;
	};
	const renderCookBreakfast = () => {
		const prepList = [
			'Set out pastries and fruit platters',
			'Fill the coffee station and teas',
			'Restock yogurt, granola and cutlery',
			'Check buffet is ready for the 7:00 AM opening'
		];
		return `${pageHeading('KITCHEN', 'Continental breakfast', 'Only breakfast prep and buffet service for the cook team.', `<button class="button button-primary" data-action="toggle-breakfast">${state.breakfast.active ? 'Pause service' : 'Start service'}</button>`)}
			<div class="metric-grid">
				<article class="metric-card"><div class="metric-top"><span>Service time</span><span class="metric-icon metric-icon-amber">${icon('clock-3')}</span></div><div class="metric-value">${state.breakfast.serviceTime}</div><div class="metric-foot"><span>${state.breakfast.active ? 'Live now' : 'Waiting to open'}</span><span>7:00 AM</span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Cook team</span><span class="metric-icon metric-icon-green">${icon('chef-hat')}</span></div><div class="metric-value">${state.breakfast.cooks.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>${state.breakfast.cooks.join(' + ')}</span><span>on shift</span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Menu items</span><span class="metric-icon metric-icon-blue">${icon('utensils')}</span></div><div class="metric-value">${state.breakfast.menu.length.toString().padStart(2, '0')}</div><div class="metric-foot"><span>Prepared today</span><span>for guests</span></div></article>
				<article class="metric-card"><div class="metric-top"><span>Buffet status</span><span class="metric-icon metric-icon-coral">${icon('sparkles')}</span></div><div class="metric-value">${state.breakfast.active ? 'Open' : 'Prep'}</div><div class="metric-foot"><span>${state.breakfast.active ? 'Service live' : 'Setup in progress'}</span><span>for breakfast</span></div></article>
			</div>
			<section class="panel full-panel"><div class="panel-heading"><div><h2>Breakfast checklist</h2><p>Kitchen tasks required before and during service</p></div></div><div class="breakfast-body"><div class="breakfast-meta"><span>Today’s menu</span><strong>${state.breakfast.menu.join(' · ')}</strong></div><div class="breakfast-menu">${prepList.map((item) => `<span>${item}</span>`).join('')}</div></div></section>`;
	};
	const renderForRole = () => {
		const roleViews = {
			admin: { settings: renderSettings },
			manager: { overview: renderOverview, reservations: renderReservations, rooms: renderRooms, guests: renderGuests, housekeeping: renderHousekeeping, reports: renderReports, employees: renderEmployees },
			frontdesk: { overview: renderFrontDeskOverview, reservations: renderReservations, rooms: renderRooms, guests: renderGuests, requests: renderRequests },
			hr: { employees: renderEmployees },
			cleaner: { tasks: renderCleanerTasks, requests: renderRequests },
			cleaner2: { tasks: renderCleanerTasks, requests: renderRequests },
			cook: { breakfast: renderCookBreakfast },
			support: { support: renderSupportHub, reports: renderReports },
			lifeguard: { pool: renderPoolHub },
			valet: { requests: renderRequests },
			security: { requests: renderRequests },
			bellhop: { requests: renderRequests },
			roomservice: { requests: renderRequests }
		};
		const currentViews = roleViews[state.currentUser.role] || roleViews.manager;
		if (!currentViews[state.view]) state.view = Object.keys(currentViews)[0];
		page.innerHTML = (currentViews[state.view] || currentViews[Object.keys(currentViews)[0]])();
		document.querySelector('#breadcrumb-current').textContent = state.view.charAt(0).toUpperCase() + state.view.slice(1).replace(/-/g, ' ');
		applyNavVisibility();
		updateReservationCount();
		refreshIcons();
	};
	const loginAs = (role, name) => {
		state.currentUser = { role, name };
		const allowed = getRoleNav();
		state.view = allowed.includes(state.view) ? state.view : allowed[0] || 'overview';
		saveState();
		render();
		toast(`Signed in as ${name}.`, 'check');
	};
	const selectHotel = (hotelId) => {
		if (!getHotelOptions().some((hotel) => hotel.id === hotelId)) return;
		currentHotelId = hotelId;
		state = loadHotelState(hotelId);
		state.currentUser = null;
		state.view = 'overview';
		saveState();
		render();
	};
	const render = () => {
		if (!currentHotelId) {
			renderHotelSelect();
			return;
		}
		if (!state.currentUser) {
			renderLoginScreen();
			return;
		}
		loginScreen.hidden = true;
		appShell.hidden = false;
		updateProfile();
		renderForRole();
	};
	const openBookingDialog = () => {
		if (!state.rooms.length) {
			toast('Add a room first so we can place your guest.', 'bed-double');
			setView('rooms');
			return;
		}
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
		if (!view || !state.currentUser) return;
		const allowed = new Set(getRoleNav());
		state.view = allowed.has(view) ? view : [...allowed][0];
		document.querySelector('#sidebar').classList.remove('sidebar-open');
		render();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};
	document.addEventListener('click', (event) => {
		if (event.target.closest('[data-close-add-hotel]')) {
			addHotelDialog.close();
			return;
		}
		if (event.target.closest('[data-close-reset-default]')) {
			resetDefaultDialog.close();
			return;
		}
		const hotelButton = event.target.closest('[data-hotel]');
		if (hotelButton) return selectHotel(hotelButton.dataset.hotel);
		if (event.target.closest('#back-to-hotels')) {
			currentHotelId = null;
			state.currentUser = null;
			return render();
		}
		const roleButton = event.target.closest('[data-role]');
		if (roleButton) return loginAs(roleButton.dataset.role, roleButton.dataset.name);
		const configTabButton = event.target.closest('[data-config-tab]');
		if (configTabButton) {
			state.configTab = configTabButton.dataset.configTab;
			saveState();
			return render();
		}
		const navButton = event.target.closest('[data-view]');
		if (navButton) return setView(navButton.dataset.view);
		const filterButton = event.target.closest('[data-filter]');
		if (filterButton) {
			state.reservationFilter = filterButton.dataset.filter;
			saveState();
			return render();
		}
		const actionButton = event.target.closest('[data-action]');
		if (!actionButton) return;
		const { action, id, room: roomNumber } = actionButton.dataset;
		if (action === 'open-add-hotel') {
			addHotelForm.reset();
			addHotelDialog.showModal();
			refreshIcons();
			return;
		}
		if (action === 'open-reset-default') {
			resetDefaultDialog.showModal();
			refreshIcons();
			return;
		}
		if (action === 'confirm-reset-default') {
			getHotelOptions().forEach((hotel) => localStorage.removeItem(hotelStorageKey(hotel.id)));
			localStorage.removeItem('ellenjoe-hotel-state-v1');
			legacyMoriohState = null;
			currentHotelId = null;
			state = loadHotelState('morioh');
			resetDefaultDialog.close();
			render();
			return toast('All hotel workspaces have been restored to their defaults.', 'rotate-ccw');
		}
		if (action === 'logout') {
			state.currentUser = null;
			state.view = 'overview';
			saveState();
			render();
			return toast('Signed out.', 'log-out');
		}
		if (action === 'new-booking') return openBookingDialog();
		if (action === 'add-room') {
			roomForm.reset();
			roomDialog.dataset.roomNumber = '';
			document.querySelector('#room-title').textContent = 'Add a room';
			roomForm.elements.number.readOnly = false;
			document.querySelector('[data-action="delete-room"]').hidden = true;
			roomForm.querySelector('[type="submit"]').innerHTML = `${icon('plus')} Add room`;
			roomDialog.showModal();
			refreshIcons();
			return;
		}
		if (action === 'edit-room') {
			if (state.currentUser?.role !== 'admin') return;
			const room = state.rooms.find((item) => item.number === roomNumber);
			if (!room) return;
			roomForm.reset();
			roomDialog.dataset.roomNumber = room.number;
			roomForm.elements.number.value = room.number;
			roomForm.elements.type.value = room.type;
			roomForm.elements.floor.value = room.floor;
			roomForm.elements.rate.value = room.rate;
			document.querySelector('#room-title').textContent = `Edit room ${room.number}`;
			document.querySelector('[data-action="delete-room"]').hidden = false;
			roomForm.querySelector('[type="submit"]').innerHTML = `${icon('check')} Save changes`;
			roomDialog.showModal();
			refreshIcons();
			return;
		}
		if (action === 'delete-room') {
			if (state.currentUser?.role !== 'admin') return;
			const room = state.rooms.find((item) => item.number === roomDialog.dataset.roomNumber);
			if (!room) return;
			if (state.bookings.some((booking) => booking.room === room.number && ['confirmed', 'checked-in'].includes(booking.status))) {
				return toast('This room has active reservations. Cancel or complete them before deleting it.', 'circle-alert');
			}
			if (!window.confirm(`Delete room ${room.number}? This cannot be undone.`)) return;
			state.rooms = state.rooms.filter((item) => item.number !== room.number);
			saveState();
			roomDialog.close();
			roomDialog.dataset.roomNumber = '';
			render();
			return toast(`Room ${room.number} deleted.`, 'trash-2');
		}
		if (action === 'assign-room') return assignCleanerToRoom(roomNumber);
		if (action === 'add-employee') {
			if (!['hr', 'manager'].includes(state.currentUser?.role)) return;
			employeeForm.reset();
			const roleSelect = populateEmployeeRoleSelect();
			const availableRoles = getAvailableEmployeeRoles();
			roleSelect.value = availableRoles.some(([role]) => role === 'frontdesk') ? 'frontdesk' : availableRoles[0]?.[0] || '';
			const salaryInput = employeeForm.elements['employee-salary'];
			salaryInput.dataset.edited = 'false';
			salaryInput.value = String(SALARY_GUIDE[roleSelect.value] || 0);
			employeeDialog.showModal();
			return;
		}
		if (action === 'toggle-breakfast') {
			state.breakfast.active = !state.breakfast.active;
			saveState();
			render();
			return toast(state.breakfast.active ? 'Continental breakfast is now live.' : 'Breakfast prep paused.', state.breakfast.active ? 'coffee' : 'clock-3');
		}
		if (action === 'toggle-pool-open') {
			state.pool.open = !state.pool.open;
			saveState();
			render();
			return toast(state.pool.open ? 'Pool reopened.' : 'Pool closed.', 'waves');
		}
		if (action === 'fire-employee' || action === 'rehire-employee') {
			if (!['hr', 'manager'].includes(state.currentUser?.role)) return;
			const employee = state.employees.find((item) => item.id === actionButton.dataset.employeeId);
			if (!employee) return;
			if (['admin', 'manager'].includes(employee.role)) return toast('Admin and Manager accounts are protected.', 'shield-check');
			if (action === 'fire-employee') {
				if (employee.status === 'terminated' || !window.confirm(`Fire ${employee.name}? Their employee record and salary history will remain in HR.`)) return;
				employee.status = 'terminated';
				state.rooms.forEach((room) => { if (room.assignedCleaner === employee.name) room.assignedCleaner = null; });
				state.breakfast.cooks = state.breakfast.cooks.filter((cook) => cook !== employee.name);
			} else {
				employee.status = 'active';
			}
			saveState();
			render();
			return toast(action === 'fire-employee' ? `${employee.name} moved to former employees.` : `${employee.name} rehired.`);
		}
		if (action === 'edit-salary') {
			if (!['hr', 'manager'].includes(state.currentUser?.role)) return;
			const employee = state.employees.find((item) => item.id === actionButton.dataset.employeeId);
			if (!employee) return;
			const salary = window.prompt(`Annual salary for ${employee.name}`, employee.salary == null ? '' : String(employee.salary));
			if (salary === null) return;
			if (!salary.trim()) return toast('Enter a salary amount.', 'circle-alert');
			const amount = Number(salary);
			if (!Number.isFinite(amount) || amount < 0) return toast('Enter a valid non-negative salary.', 'circle-alert');
			employee.salary = amount;
			saveState();
			render();
			return toast(`Salary updated for ${employee.name}.`, 'wallet');
		}
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
		if (action === 'toggle-ticket') {
			const ticket = state.tickets.find((item) => item.id === id);
			if (!ticket) return;
			ticket.status = ticket.status === 'Open' ? 'Resolved' : 'Open';
			saveState();
			render();
			return toast(`Request ${ticket.id} ${ticket.status.toLowerCase()}.`, 'life-buoy');
		}
		if (action === 'export-bookings') {
			const headers = ['Booking', 'Guest', 'Room', 'Check-in', 'Check-out', 'Guests', 'Status'];
			const rows = state.bookings.map((item) => [item.id, item.guest, item.room, item.checkin, item.checkout, item.guests, statusLabel(item.status)]);
			const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
			const link = document.createElement('a');
			link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
			link.download = 'hotel-reservations.csv';
			link.click();
			URL.revokeObjectURL(link.href);
			return toast('Reservations exported.');
		}
		if (action === 'save-settings') {
			const nextName = document.querySelector('#property-name')?.value?.trim() || state.config.hotelName;
			const nextLocation = document.querySelector('#property-location')?.value?.trim() || state.config.location;
			state.config.hotelName = nextName;
			state.config.location = nextLocation;
			const customHotel = customHotels.find((hotel) => hotel.id === currentHotelId);
			if (customHotel) {
				customHotel.name = nextName;
				customHotel.description = nextLocation || 'Custom hotel workspace';
				customHotel.location = nextLocation;
				saveCustomHotels();
			}
			state.config.features.continentalBreakfast = document.querySelector('#feature-breakfast')?.checked ?? state.config.features.continentalBreakfast;
			state.config.features.pool = document.querySelector('#feature-pool')?.checked ?? state.config.features.pool;
			saveState();
			render();
			return toast('Property settings saved.');
		}
	});
	addHotelForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const formData = new FormData(addHotelForm);
		const name = String(formData.get('hotel-name')).trim();
		const location = String(formData.get('hotel-location')).trim();
		if (!name) return toast('Enter a hotel name first.', 'circle-alert');
		if (getHotelOptions().some((hotel) => hotel.name.toLowerCase() === name.toLowerCase())) {
			return toast('A hotel with that name already exists.', 'circle-alert');
		}
		const slug = name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'hotel';
		const hotel = { id: `custom-${slug}-${Date.now().toString(36)}`, name, description: location || 'Custom hotel workspace', icon: 'building-2', location };
		customHotels.push(hotel);
		saveCustomHotels();
		const initialState = cloneState(blankState);
		initialState.config.hotelName = name;
		initialState.config.location = location;
		localStorage.setItem(hotelStorageKey(hotel.id), JSON.stringify(initialState));
		addHotelDialog.close();
		addHotelForm.reset();
		selectHotel(hotel.id);
		toast(`${name} workspace created.`, 'hotel');
	});
	page.addEventListener('submit', (event) => {
		if (event.target.id !== 'request-form') return;
		event.preventDefault();
		if (!['cleaner', 'cleaner2', 'frontdesk', ...REQUESTING_STAFF_ROLES].includes(state.currentUser?.role)) return;
		const formData = new FormData(event.target);
		const category = String(formData.get('category')).trim();
		const details = String(formData.get('details')).trim();
		if (!category || !details) return toast('Add a request type and details.', 'circle-alert');
		const room = String(formData.get('room')).trim();
		state.tickets.unshift({
			id: `T-${Date.now()}`,
			requester: state.currentUser.name,
			room,
			issue: `${category}: ${details}`,
			priority: 'Normal',
			status: 'Open'
		});
		saveState();
		render();
		return toast('Your request was sent to the support queue.', 'life-buoy');
	});
	document.addEventListener('keydown', (event) => {
		const roomRow = event.target.closest('.config-room-row');
		if (!roomRow || !['Enter', ' '].includes(event.key)) return;
		event.preventDefault();
		roomRow.click();
	});
	bookingForm.elements.checkin.addEventListener('change', () => {
		const nextDay = new Date(`${bookingForm.elements.checkin.value}T12:00:00`);
		nextDay.setDate(nextDay.getDate() + 1);
		bookingForm.elements.checkout.min = isoDate(nextDay);
		if (bookingForm.elements.checkout.value <= bookingForm.elements.checkin.value) bookingForm.elements.checkout.value = isoDate(nextDay);
	});
	roomForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const formData = new FormData(roomForm);
		const originalNumber = roomDialog.dataset.roomNumber || '';
		const number = String(formData.get('number')).trim();
		if (state.rooms.some((room) => room.number.toLowerCase() === number.toLowerCase() && room.number !== originalNumber)) {
			toast(`Room ${number} already exists.`, 'circle-alert');
			return;
		}
		if (originalNumber) {
			const room = state.rooms.find((item) => item.number === originalNumber);
			if (!room) return toast('This room no longer exists.', 'circle-alert');
			Object.assign(room, { number, type: String(formData.get('type')).trim(), floor: String(formData.get('floor')), rate: Number(formData.get('rate')) });
			if (number !== originalNumber) {
				state.bookings.filter((booking) => booking.room === originalNumber).forEach((booking) => { booking.room = number; });
				state.tickets.filter((ticket) => ticket.room === originalNumber).forEach((ticket) => { ticket.room = number; });
			}
		} else {
			state.rooms.push({ number, type: String(formData.get('type')).trim(), floor: String(formData.get('floor')), rate: Number(formData.get('rate')), housekeeping: 'clean', assignedCleaner: null });
		}
		saveState();
		roomDialog.close();
		roomDialog.dataset.roomNumber = '';
		render();
		return toast(originalNumber ? `Room ${number} updated.` : `Room ${number} is ready for its first guest.`, 'bed-double');
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
		state.bookings.unshift({
			id: `MH-${Math.floor(1000 + Math.random() * 9000)}`,
			guest,
			room: roomNumber,
			checkin,
			checkout,
			guests: Number(formData.get('guests')),
			status: 'confirmed',
			notes: String(formData.get('notes')).trim()
		});
		saveState();
		bookingForm.reset();
		dialog.close();
		state.view = 'reservations';
		render();
		toast(`Reservation created for ${guest}.`);
	});
	employeeForm.addEventListener('submit', (event) => {
		event.preventDefault();
		if (!['hr', 'manager'].includes(state.currentUser?.role)) return;
		const formData = new FormData(employeeForm);
		const name = String(formData.get('employee-name')).trim();
		const role = String(formData.get('employee-role'));
		const salary = Number(formData.get('employee-salary'));
		if (!name) return toast('Add an employee name first.', 'user-round');
		if (!getAvailableEmployeeRoles().some(([availableRole]) => availableRole === role)) return toast('Choose an available employee role.', 'circle-alert');
		if (!Number.isFinite(salary) || salary < 0) return toast('Enter a valid non-negative salary.', 'circle-alert');
		if (state.employees.some((employee) => employee.name.toLowerCase() === name.toLowerCase() && employee.status !== 'terminated')) {
			toast(`${name} is already on the roster.`, 'users-round');
			return;
		}
		state.employees.push({ id: `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name, role, salary, status: 'active' });
		saveState();
		employeeDialog.close();
		employeeForm.reset();
		render();
		return toast(`${name} added to the team.`, 'check');
	});
	employeeForm.elements['employee-role'].addEventListener('change', (event) => {
		const salaryInput = employeeForm.elements['employee-salary'];
		if (salaryInput.dataset.edited !== 'true') salaryInput.value = String(SALARY_GUIDE[event.target.value] || 0);
	});
	employeeForm.elements['employee-salary'].addEventListener('input', (event) => {
		event.target.dataset.edited = 'true';
	});
	document.querySelectorAll('[data-close-dialog]').forEach((buttonElement) => buttonElement.addEventListener('click', () => dialog.close()));
	document.querySelectorAll('[data-close-room-dialog]').forEach((buttonElement) => buttonElement.addEventListener('click', () => roomDialog.close()));
	document.querySelectorAll('[data-close-employee-dialog]').forEach((buttonElement) => buttonElement.addEventListener('click', () => employeeDialog.close()));
	document.querySelector('#menu-button').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('sidebar-open'));
	render();
})();
