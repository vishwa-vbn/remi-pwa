import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logout } from '../../../store/auth/authActions';
import { setSelectedPeriod, updateNotificationPreference, clearTasks } from '../../../store/settings/settingsActions';
import SettingsView from './SettingsView';

class SettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  componentDidMount() {
    if (!this.props.selectedPeriod) {
      this.props.setSelectedPeriod('week');
    }
  }

  handleClearData = async () => {
    const { selectedPeriod, user, clearTasks } = this.props;
    if (!user?.id) {
      console.error('User ID is missing');
      return;
    }
    try {
      await clearTasks(selectedPeriod, user.id);
      console.log('Data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  toggleNotifications = async (value) => {
    try {
      // Web notifications can be implemented later if needed
      this.props.updateNotificationPreference(this.props.user?.id, value);
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  handleLogout = () => {
    this.props.logout();
  };

  render() {
    return (
      <SettingsView
        selectedPeriod={this.props.selectedPeriod}
        open={this.state.open}
        setOpen={(open) => this.setState({ open })}
        setSelectedPeriod={this.props.setSelectedPeriod}
        notificationsEnabled={this.props.notificationsEnabled}
        toggleNotifications={this.toggleNotifications}
        handleClearData={this.handleClearData}
        handleLogout={this.handleLogout}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  selectedPeriod: state.settings.selectedPeriod,
  notificationsEnabled: state.settings.notificationsEnabled,
  user: state.auth.user,
});

const mapDispatchToProps = {
  logout,
  setSelectedPeriod,
  updateNotificationPreference,
  clearTasks,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);