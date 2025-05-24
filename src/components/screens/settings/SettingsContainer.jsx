// import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { logout } from '../../../store/auth/authActions';
// import { setSelectedPeriod, updateNotificationPreference, clearTasks } from '../../../store/settings/settingsActions';
// import SettingsView from './SettingsView';

// class SettingsContainer extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       open: false,
//     };
//   }

//   componentDidMount() {
//     if (!this.props.selectedPeriod) {
//       this.props.setSelectedPeriod('week');
//     }
//   }

//   handleClearData = async () => {
//     const { selectedPeriod, user, clearTasks } = this.props;
//     if (!user?.id) {
//       console.error('User ID is missing');
//       return;
//     }
//     try {
//       await clearTasks(selectedPeriod, user.id);
//       console.log('Data cleared successfully');
//     } catch (error) {
//       console.error('Error clearing data:', error);
//     }
//   };

//   toggleNotifications = async (value) => {
//     try {
//       // Web notifications can be implemented later if needed
//       this.props.updateNotificationPreference(this.props.user?.id, value);
//     } catch (error) {
//       console.error('Error toggling notifications:', error);
//     }
//   };

//   handleLogout = () => {
//     this.props.logout();
//   };

//   render() {
//     return (
//       <SettingsView
//         selectedPeriod={this.props.selectedPeriod}
//         open={this.state.open}
//         setOpen={(open) => this.setState({ open })}
//         setSelectedPeriod={this.props.setSelectedPeriod}
//         notificationsEnabled={this.props.notificationsEnabled}
//         toggleNotifications={this.toggleNotifications}
//         handleClearData={this.handleClearData}
//         handleLogout={this.handleLogout}
//       />
//     );
//   }
// }

// const mapStateToProps = (state) => ({
//   selectedPeriod: state.settings.selectedPeriod,
//   notificationsEnabled: state.settings.notificationsEnabled,
//   user: state.auth.user,
// });

// const mapDispatchToProps = {
//   logout,
//   setSelectedPeriod,
//   updateNotificationPreference,
//   clearTasks,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);

import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { logout } from '../../../store/auth/authActions';
import { setSelectedPeriod, updateNotificationPreference, clearTasks } from '../../../store/settings/settingsActions';
import SettingsView from './SettingsView';

const SettingsContainer = ({ logout, setSelectedPeriod, updateNotificationPreference, clearTasks, selectedPeriod, notificationsEnabled, user, isLoading }) => {
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!selectedPeriod) {
      setSelectedPeriod('week');
    }
  }, [selectedPeriod, setSelectedPeriod]);

  const handleClearData = useCallback(async () => {
    if (!user?.id) {
      setFeedback({ open: true, message: 'User ID is missing', severity: 'error' });
      return;
    }
    try {
      const result = await clearTasks(selectedPeriod, user.id);
      setFeedback({ open: true, message: result.message, severity: 'success' });
    } catch (error) {
      setFeedback({ open: true, message: 'Failed to clear tasks. Please try again.', severity: 'error' });
    }
  }, [clearTasks, selectedPeriod, user]);

  const toggleNotifications = useCallback(async (value) => {
    try {
      const result = await updateNotificationPreference(user?.id, value);
      setFeedback({ open: true, message: result.message, severity: 'success' });
    } catch (error) {
      setFeedback({ open: true, message: 'Failed to update notifications. Please try again.', severity: 'error' });
    }
  }, [updateNotificationPreference, user]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <SettingsView
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      notificationsEnabled={notificationsEnabled}
      toggleNotifications={toggleNotifications}
      handleClearData={handleClearData}
      handleLogout={handleLogout}
      isLoading={isLoading}
      feedback={feedback}
      setFeedback={setFeedback}
    />
  );
};

const mapStateToProps = (state) => ({
  selectedPeriod: state.settings.selectedPeriod,
  notificationsEnabled: state.settings.notificationsEnabled,
  user: state.auth.user,
  isLoading: state.loader.isLoading,
});

const mapDispatchToProps = {
  logout,
  setSelectedPeriod,
  updateNotificationPreference,
  clearTasks,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);