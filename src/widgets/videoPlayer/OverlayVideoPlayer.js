import React from 'react';
import {BackHandler, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import VideoPlayer, {defaultVideoHeight} from "./VideoPlayer";
import Orientation from "react-native-orientation";

/**
 * 浮层播放组件,基于 VideoPlayer, 使用时，
 * 1. 一个普通组件，会作为一个浮层浮在主内容区组件上面
 * 2. 竖屏时，视频播放区位于屏幕竖直方向中央
 * 3. 横屏时，视频播放区占满全屏
 *
 *
 * 使用方法:
 * 1.和屏幕主内容组件放在同一个容器View下面
 * 2.所从属的容器View使用{flex:1}占满可用区,不能是ScrollView，
 * 3.该组件要位于主内容组件后面以确保显示时浮在主内容组件的上面
 */
export default class OverlayVideoPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFullScreen: false,
            currentUrl: this.props.url,
            title: this.props.title,
            videoHeight: defaultVideoHeight,
            videoList: this.props.videoList,
        };
        BackHandler.addEventListener('hardwareBackPress', this._backButtonPress);
        Orientation.addOrientationListener(this._orientationDidChange);
    }

    componentWillUnmount() {
        this._clearTimeUnlockOrientations();
        BackHandler.removeEventListener('hardwareBackPress', this._backButtonPress);
        Orientation.removeOrientationListener(this._orientationDidChange);
    }

    render() {
        const styleVideoPlayer = {left: 0};

        return (<TouchableWithoutFeedback style={{flex: 1}} onPress={this._onTapBackButton} onLayout={this._onLayout}>
                <View style={styles.container}>
                    <VideoPlayer
                        ref={(ref) => this.videoPlayer = ref}
                        videoURL={this.state.currentUrl}
                        videoTitle={this.state.title}
                        onToggleFullScreen={this._onToggleScreen}
                        onFullScreenChange={this._onFullScreenChange}
                        onTapBackButton={this._onTapBackButton}
                        videoList={this.state.videoList}
                        noBackButtonWhenInline={false}
                    />
                </View>
            </TouchableWithoutFeedback>
        )
    }


    /// 处理安卓物理返回键，横屏时点击返回键回到竖屏，再次点击回到上个界面
    _backButtonPress = () => {
        this._onTapBackButton();
        return true;
    };
    /**
     *  视频播放控件上点击了切换屏幕模式的按钮时的回调
     * @param isFullScreen
     * @private
     */
    _onToggleScreen = (isFullScreen) => {
        if (isFullScreen) {
            console.log("OverlayVideoPlayer : 视频播放控件通知退出全屏点击事件");
            Orientation.lockToPortrait();
        } else {
            console.log("OverlayVideoPlayer : 视频播放控件通知进入全屏点击事件");
            Orientation.lockToLandscapeRight();
        }

        this._unlockOrientationsAfterSeconds(10000);
    };


    /**
     * 若干毫秒后结束屏幕转动检测的锁定
     * @param ms
     * @private
     */
    _unlockOrientationsAfterSeconds(ms) {
        this.timerUnlockAllOrientations = setTimeout(() => {
            Orientation.unlockAllOrientations()
        }, ms);
    }

    _clearTimeUnlockOrientations() {
        if (this.timerUnlockAllOrientations)
            clearTimeout(this.timerUnlockAllOrientations);
    }

    _onFullScreenChange = (isFullScreen) => {
        if (isFullScreen) {
            console.log("OverlayVideoPlayer : 视频播放控件进入了全屏");
        } else {
            console.log("OverlayVideoPlayer : 视频播放控件退出了全屏");
        }

        this.props.onFullScreenChange && this.props.onFullScreenChange(this.state.isFullScreen);
    };

    _onTapBackButton = () => {
        this.props.onTapBackButton && this.props.onTapBackButton();
    };

    _onLayout = (event) => {
        let {width, height} = event.nativeEvent.layout;
        let isLandscape = (width > height);
        if (isLandscape) {
            this.setState({
                isFullScreen: true,
                videoHeight: height
            });
            this.videoPlayer.updateLayout(width, height, true);
        } else {
            this.setState({
                isFullScreen: false,
                videoHeight: width * 9 / 16
            });
            this.videoPlayer.updateLayout(width, width * 9 / 16, false);
        }
    };

    /**
     * 仅在屏幕转动检测打开时有效
     * @param orientation
     * @private
     */
    _orientationDidChange = (orientation) => {
        console.log("OverlayVideoPlayer 发现屏幕方向变化:" + orientation);
        if (orientation === 'PORTRAIT') {

        } else {
        }
    };
}


export const styles = StyleSheet.create({
    container: {
        position: "absolute",
        backgroundColor: '#47474799',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
});