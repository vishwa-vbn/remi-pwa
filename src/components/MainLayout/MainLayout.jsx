import React from "react";
import { bindActionCreators } from "redux";
import { connect } from 'react-redux';
import Header from '../../common/header'
import BottomNavigation from "../../common/BottomNavigation";

import "./MainLayout.css";

class MainLayout extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <div className=" w-screen h-screen flex flex-col items-center min-h-screen bg-gray-100">
        <Header/>
        <main className="h-screen w-screen overflow-auto scrollbar-hide">
          {this.props.children}
        </main>
        <BottomNavigation/>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({  }, dispatch);

export default connect(null, mapDispatchToProps)(MainLayout);
