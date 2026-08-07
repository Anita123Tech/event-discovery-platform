var Booking = {
  getBookings: function() {
    return Utils.getStorage('bookings', []);
  },

  saveBookings: function(bookings) {
    Utils.setStorage('bookings', bookings);
  },

  generateId: function() {
    return 'BK-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  },

  getUserBookings: function() {
    if (!Auth.isLoggedIn()) return [];
    var userId = Auth.currentUser.id;
    var bookings = this.getBookings();
    return bookings.filter(function(b) { return b.userId === userId; });
  },

  isBooked: function(eventId) {
    if (!Auth.isLoggedIn()) return false;
    var userId = Auth.currentUser.id;
    var bookings = this.getBookings();
    return bookings.some(function(b) {
      return b.userId === userId && b.eventId === parseInt(eventId) && b.status !== 'cancelled';
    });
  },

  getBookingForEvent: function(eventId) {
    if (!Auth.isLoggedIn()) return null;
    var userId = Auth.currentUser.id;
    var bookings = this.getBookings();
    return bookings.find(function(b) {
      return b.userId === userId && b.eventId === parseInt(eventId) && b.status !== 'cancelled';
    }) || null;
  },

  create: function(eventId, ticketType, quantity) {
    if (!Auth.isLoggedIn()) {
      return { success: false, error: 'Please log in to book events' };
    }

    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 1 || quantity > 10) {
      return { success: false, error: 'Quantity must be between 1 and 10' };
    }

    if (!ticketType) {
      return { success: false, error: 'Please select a ticket type' };
    }

    if (this.isBooked(eventId)) {
      return { success: false, error: 'You have already booked this event' };
    }

    var events = Utils.getStorage('cachedEvents', null);
    if (!events || !events.length) {
      return { success: false, error: 'Event data not available' };
    }

    var event = events.find(function(e) { return e.id === parseInt(eventId); });
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    var priceMap = { 'general': event.price, 'vip': Math.round(event.price * 1.5), 'premium': Math.round(event.price * 2) };
    var unitPrice = priceMap[ticketType] || event.price;
    if (event.price === 0) unitPrice = 0;

    var booking = {
      id: this.generateId(),
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      eventImage: event.image,
      eventCategory: event.category,
      userId: Auth.currentUser.id,
      ticketType: ticketType,
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: unitPrice * quantity,
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };

    var bookings = this.getBookings();
    bookings.push(booking);
    this.saveBookings(bookings);

    return { success: true, booking: booking };
  },

  cancel: function(bookingId) {
    var bookings = this.getBookings();
    var booking = bookings.find(function(b) { return b.id === bookingId; });
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }
    if (!Auth.isLoggedIn() || booking.userId !== Auth.currentUser.id) {
      return { success: false, error: 'Unauthorized' };
    }
    booking.status = 'cancelled';
    this.saveBookings(bookings);
    return { success: true, booking: booking };
  },

  getStats: function() {
    var bookings = this.getUserBookings();
    var confirmed = bookings.filter(function(b) { return b.status === 'confirmed'; }).length;
    var cancelled = bookings.filter(function(b) { return b.status === 'cancelled'; }).length;
    var totalSpent = bookings
      .filter(function(b) { return b.status === 'confirmed'; })
      .reduce(function(sum, b) { return sum + b.totalPrice; }, 0);
    return { total: bookings.length, confirmed: confirmed, cancelled: cancelled, totalSpent: totalSpent };
  },

  formatDate: function(dateStr) {
    return Utils.formatDate(dateStr);
  },

  formatTime: function(timeStr) {
    return Utils.formatTime(timeStr);
  },

  getStatusClass: function(status) {
    if (status === 'confirmed') return 'booking-status--confirmed';
    if (status === 'cancelled') return 'booking-status--cancelled';
    return 'booking-status--pending';
  }
};
