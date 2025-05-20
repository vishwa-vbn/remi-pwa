// import React from "react";
// import { bindActionCreators } from "redux";
// import { connect } from "react-redux";
// import Header from "../../common/header";
// import BottomNavigation from "../../common/BottomNavigation";
// import "./MainLayout.css";
// import VoiceAssistant from "../../common/VoiceAssistant";

// class MainLayout extends React.Component {
//   componentDidMount() {}

//   render() {
//     return (
//       <div className="min-h-screen h-screen w-full flex flex-col bg-gray-100">
//         <VoiceAssistant/>
//         {window.location.pathname !== "/settings" ? (
//           <Header className="flex-none" style={{ height: "10%" }} />
//         ) : null}
//         <main
//           className="w-full overflow-auto scrollbar-hide"
//           style={{  height: "84%" }}
//         >
//           {this.props.children}
//         </main>
//         <BottomNavigation className="flex-none"  />
//       </div>
//     );
//   }
// }

// const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

// export default connect(null, mapDispatchToProps)(MainLayout);


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
    const isSettingsRoute = window.location.pathname === "/settings";
    return (
      <div className="min-h-screen h-[100vh] w-full flex flex-col bg-gray-100">
        <VoiceAssistant />
        {!isSettingsRoute ? (
          <Header className="flex-none" style={{ height: "10%" }} />
        ) : null}
        <main
          className="w-full overflow-auto scrollbar-hide"
          style={{ height: isSettingsRoute ? "94%" : "84%" }}
        >
          {this.props.children}
        </main>
        <BottomNavigation className="flex-none" />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(null, mapDispatchToProps)(MainLayout);