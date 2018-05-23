import React from 'react';
import {View, ScrollView, Text, Image, BackHandler, TouchableHighlight} from 'react-native';
import VideoPlayer, {defaultVideoHeight, isSystemIOS, statusBarHeight} from "../widgets/videoPlayer/VideoPlayer";
import Orientation from "react-native-orientation";
import {videoList, styles} from "./VideoListScreen";

export default class InlinePlayScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        const params = navigation.state.params || {};
        if (params.fullScreenVideo) {
            return {header: null}
        }

        return {
            header: null
            //headerTitle: '视频播放',
        }
    };


    constructor(props) {
        super(props);
        this.state = {
            isFullScreen: false,
            currentUrl: this.props.navigation.state.params.url,
            videoHeight: defaultVideoHeight
        };
        BackHandler.addEventListener('hardwareBackPress', this._backButtonPress);
        Orientation.addOrientationListener(this._orientationDidChange);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this._backButtonPress);
        Orientation.removeOrientationListener(this._orientationDidChange);
    }

    render() {
        let statusBarView = null;
        let videoTopHeight = 0;
        if (isSystemIOS) {
            statusBarView =
                (<View
                    style={[{backgroundColor: '#000'}, this.state.isFullScreen ? {height: 0} : {height: statusBarHeight}]}/>);
            videoTopHeight = this.state.isFullScreen ? 0 : statusBarHeight;
        }
        return (
            <View style={styles.container} onLayout={this._onLayout}>
                {statusBarView}
                <VideoPlayer
                    ref={(ref) => this.videoPlayer = ref}
                    style={{position: 'absolute', left: 0, top: videoTopHeight}}
                    videoURL={this.state.currentUrl}
                    videoTitle={this.state.currentUrl}
                    onToggleFullScreen={this._onToggleScreen}
                    onTapBackButton={this._onClickBackButton}
                    videoList={videoList}
                    noBackButtonWhenInline={true}
                />
                <ScrollView style={[styles.container, {marginTop: this.state.videoHeight}]}>
                    {
                        videoList.map((item, index) => {
                            let isSelected = (this.state.currentUrl === item);
                            return (
                                <TouchableHighlight key={index} underlayColor={'#dcdcdc'} onPress={() => {
                                    this.itemSelected(item)
                                }}>
                                    <View style={styles.itemContainer}>
                                        <Text
                                            style={[styles.title, isSelected ? styles.title_active : null]}>视频{index + 1}</Text>
                                        <Image source={require('../image/icon_right.png')} style={styles.rightIcon}/>
                                    </View>
                                </TouchableHighlight>
                            )
                        })
                    }
                </ScrollView>
            </View>
        )
    }

    /// 处理安卓物理返回键，横屏时点击返回键回到竖屏，再次点击回到上个界面
    _backButtonPress = () => {
        if (this.state.isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            this.props.navigation.goBack();
        }
        return true;
    };

    itemSelected(url) {
        this.setState({
            currentUrl: url
        });
        this.videoPlayer.updateVideo(url, 0, null);
    }

    _onToggleScreen = (isFullScreen) => {
        if (isFullScreen) {
            console.log("InlinePlayScreen : 视频播放控件通知退出全屏");
            Orientation.lockToPortrait();
        } else {
            console.log("InlinePlayScreen : 视频播放控件通知进入全屏");
            Orientation.lockToLandscapeRight();
        }
    };

    _onClickBackButton = () => {
        this.props.navigation.goBack();
    };

    _onLayout = (event) => {
        let {x, y, width, height} = event.nativeEvent.layout;
        let isLandscape = (width > height);
        if (isLandscape) {
            this.setState({
                isFullScreen: true,
                videoHeight: height
            });
            this.props.navigation.setParams({fullScreenVideo: true})
            this.videoPlayer.updateLayout(width, height, true);
        } else {
            this.setState({
                isFullScreen: false,
                videoHeight: width * 9 / 16
            });
            this.props.navigation.setParams({fullScreenVideo: false})
            this.videoPlayer.updateLayout(width, width * 9 / 16, false);
        }
        Orientation.unlockAllOrientations();
    };

    _orientationDidChange = (orientation) => {
        console.log("InlinePlayScreen 发现屏幕方向变化:" + orientation);
        if (orientation === 'PORTRAIT') {
        } else {

        }
    };
}