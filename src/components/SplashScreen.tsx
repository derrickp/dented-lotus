import * as React from "react";

import LinearProgress from 'material-ui/LinearProgress';

export interface SplashScreenProps { }

export interface SplashScreenState { }

export class SplashScreen extends React.Component<SplashScreenProps, SplashScreenState> {

    getLoadingView() {
        return;
    }

    render() {
        return <div key={"wrapper"} className="loading-wrapper">
            <img key={"image"} className="loading-image"></img>
            <LinearProgress mode="indeterminate"></LinearProgress>
        </div>;
    }
}