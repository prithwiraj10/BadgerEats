import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Utensils, Bell, User, Phone, Settings, List, Map } from 'lucide-react';

export default function CampusFoodAlerts() {
  const [view, setView] = useState('home');
  const [displayMode, setDisplayMode] = useState('feed');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferences: {
      freeEventFood: true,
      diningHallMenus: false,
      specialEvents: false
    }
  });
  const [submitted, setSubmitted] = useState(false);

  const foodUpdates = [
    {
      id: 1,
      type: 'event',
      title: 'Free Pizza at Student Center',
      location: 'Student Center, Room 204',
      time: '6:00 PM - 8:00 PM',
      date: 'Today',
      description: 'Club meeting with free pizza for all attendees'
    },
    {
      id: 2,
      type: 'dining',
      title: 'West Dining Hall Dinner',
      location: 'West Dining Hall',
      time: '5:00 PM - 9:00 PM',
      date: 'Today',
      description: 'Tonight: BBQ chicken, vegetarian pasta, salad bar'
    },
    {
      id: 3,
      type: 'event',
      title: 'Free Bagels & Coffee',
      location: 'Library Main Entrance',
      time: '8:00 AM - 10:00 AM',
      date: 'Tomorrow',
      description: 'Study session breakfast sponsored by Student Government'
    },
    {
      id: 4,
      type: 'dining',
      title: 'East Dining Hall Lunch Special',
      location: 'East Dining Hall',
      time: '11:00 AM - 2:00 PM',
      date: 'Today',
      description: 'Asian cuisine day: Pad Thai, spring rolls, miso soup'
    },
    {
      id: 5,
      type: 'event',
      title: 'Ice Cream Social',
      location: 'Campus Quad',
      time: '3:00 PM - 5:00 PM',
      date: 'Today',
      description: 'Welcome week celebration with free ice cream'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference]
      }
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.phone && formData.phone.length === 10) {
      const formattedPhone = formData.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      console.log('Submitted:', { ...formData, phone: formattedPhone });
      setSubmitted(true);
      setTimeout(() => {
        setView('updates');
        setSubmitted(false);
      }, 2000);
    } else {
      alert('Please fill in all fields correctly. Phone number must be 10 digits.');
    }
  };

  const getTypeColor = (type) => {
    return type === 'event' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  };

  const getTypeIcon = (type) => {
    return type === 'event' ? <Bell className="w-4 h-4" /> : <Utensils className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-800">Campus Food Alerts</h1>
            </div>
            <nav className="flex gap-4">
              <button
                onClick={() => setView('home')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'home' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setView('updates')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'updates' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Food Updates
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Never Miss Free Food Again!</h2>
              <p className="text-gray-600 mb-6">
                Get instant text alerts about free food events and dining hall menus across campus. 
                Customize your preferences and stay in the loop!
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Bell className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Free Event Food</h3>
                    <p className="text-sm text-gray-600">Get notified about club meetings, study sessions, and campus events with free food</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Utensils className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Dining Hall Menus</h3>
                    <p className="text-sm text-gray-600">Daily menu updates from all campus dining halls</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Location-Based</h3>
                    <p className="text-sm text-gray-600">Find food opportunities near you across campus</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">
                  <strong>Privacy Note:</strong> Your phone number is only used for text alerts. 
                  Reply STOP anytime to unsubscribe.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign Up for Alerts</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">You're all set!</h3>
                  <p className="text-gray-600">You'll start receiving alerts based on your preferences.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="1234567890"
                      maxLength="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">10 digits, no spaces or dashes</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Settings className="w-4 h-4" />
                      Alert Preferences
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.freeEventFood}
                          onChange={() => handlePreferenceChange('freeEventFood')}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <div>
                          <div className="font-medium text-gray-800">Free Event Food</div>
                          <div className="text-sm text-gray-500">Club events, study sessions, celebrations</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.diningHallMenus}
                          onChange={() => handlePreferenceChange('diningHallMenus')}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <div>
                          <div className="font-medium text-gray-800">Dining Hall Menus</div>
                          <div className="text-sm text-gray-500">Daily menu updates from campus dining</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.specialEvents}
                          onChange={() => handlePreferenceChange('specialEvents')}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <div>
                          <div className="font-medium text-gray-800">Special Events</div>
                          <div className="text-sm text-gray-500">Food trucks, pop-ups, limited-time offerings</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition shadow-lg hover:shadow-xl"
                  >
                    Start Receiving Alerts
                  </button>

                  <p className="text-xs text-center text-gray-500">
                    By signing up, you agree to receive SMS alerts. Standard message rates may apply. Reply STOP to unsubscribe anytime.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'updates' && (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Recent Food Updates</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplayMode('feed')}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      displayMode === 'feed' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Feed
                  </button>
                  <button
                    onClick={() => setDisplayMode('map')}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      displayMode === 'map' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    Map
                  </button>
                </div>
              </div>
            </div>

            {displayMode === 'feed' ? (
              <div className="grid md:grid-cols-2 gap-6">
                {foodUpdates.map(update => (
                  <div key={update.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{update.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getTypeColor(update.type)}`}>
                          {getTypeIcon(update.type)}
                          {update.type === 'event' ? 'Event' : 'Dining'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{update.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>{update.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span>{update.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>{update.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3">
                      <button className="text-orange-500 font-medium text-sm hover:text-orange-600 transition">
                        Get Directions →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative h-96 bg-gradient-to-br from-orange-100 to-yellow-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Interactive Campus Map</p>
                      <p className="text-sm text-gray-500 mt-2">Showing {foodUpdates.length} food locations</p>
                    </div>
                  </div>
                  
                  {foodUpdates.slice(0, 3).map((update, idx) => (
                    <div
                      key={update.id}
                      className="absolute bg-white rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition"
                      style={{
                        left: `${20 + idx * 25}%`,
                        top: `${30 + idx * 15}%`
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-gray-800">{update.title.substring(0, 20)}...</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                    </div>
                  ))}
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-3">All Locations</h3>
                  <div className="space-y-2">
                    {foodUpdates.map(update => (
                      <div key={update.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">{update.title}</div>
                          <div className="text-xs text-gray-500">{update.location}</div>
                        </div>
                        <span className="text-xs text-gray-500">{update.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            Campus Food Alerts • Text STOP to unsubscribe • Questions? Contact support@campusfood.edu
          </p>
        </div>
      </footer>
    </div>
  );
}
