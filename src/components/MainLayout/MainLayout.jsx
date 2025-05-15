import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Header from "../../common/header";
import BottomNavigation from "../../common/BottomNavigation";
import "./MainLayout.css";
import VoiceAssistant from "../../common/VoiceAssistant";

class MainLayout extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <div className="min-h-screen h-screen w-full flex flex-col bg-gray-100">
        <VoiceAssistant/>
        {window.location.pathname !== "/settings" ? (
          <Header className="flex-none" style={{ height: "10%" }} />
        ) : null}
        <main
          className="flex-grow w-full overflow-auto scrollbar-hide"
          style={{ height: "80%" }}
        >
          {this.props.children}
        </main>
        <BottomNavigation className="flex-none" style={{ height: "10%" }} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(null, mapDispatchToProps)(MainLayout);