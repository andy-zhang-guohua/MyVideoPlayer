import React from 'react';
import {
    DeviceInfo,
    Dimensions,
    Image,
    Platform,
    Slider,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import PropTypes from 'prop-types';
import Video from 'react-native-video';
import Orientation from "react-native-orientation";
import SelectDefinitionView from "./components/SelectDefinitionView";
import SelectVideoView from "./components/SelectVideoView";
import ShareOptionView from "./components/ShareOptionView";
import MoreSettingView from "./components/MoreSettingView";

/**
 * 视频播放控件，
 */
export default class VideoPlayer extends React.Component {

    static propTypes = {
        onToggleFullScreen: PropTypes.func,
        onTapBackButton: PropTypes.func
    };

    static defaultProps = {
        videoWidth: screenWidth,    // 默认视频宽度，竖屏下为屏幕宽度
        videoHeight: defaultVideoHeight, // 默认视频高度，竖屏下为宽度的9/16，使视频保持16：9的宽高比
        videoURL: '',    // 视频的地址
        videoCover: '',  // 视频的封面图地址
        videoTitle: '',  // 视频的标题
        enableSwitchScreen: true, // 是否允许视频播放模式切换 (inline/fullscreen)
        videoList: [],// 可选择视频列表
        tag: 0,
        noBackButtonWhenInline: false,// inline 模式下不显示返回按钮
    };

    constructor(props) {
        super(props);
        let hasCover = true;
        if (this.props.videoCover == null || this.props.videoCover === '') {
            hasCover = false;
        }
        this.state = {
            x: 0,
            videoWidth: screenWidth,
            videoHeight: defaultVideoHeight,
            videoUrl: this.props.videoURL,
            videoCover: this.props.videoCover,
            videoTitle: this.props.videoTitle,
            noBackButtonWhenInline: this.props.noBackButtonWhenInline,
            hasCover: hasCover, // 是否有视频封面
            paused: true,  // 是否暂停，控制视频的播放和暂停
            duration: 0,     // 视频的时长
            currentTime: 0,  // 视屏当前播放的时间
            isFullScreen: false, // 是否全屏
            showControlBar: false, // 是否显示播放的工具栏
            showVideoCover: hasCover, // 是否显示视频封面
            playFromBeginning: false, // 视频是否需要从头开始播放
            muted: false,  // 是否静音
            volume: 1.0,   // 音量大小
            playRate: 1.0, // 播放速率
            lastSingleTapTime: 0,   //上次单点击视频区域的时间
            showDefinitionView: false, // 是否显示清晰度切换界面
            showVideoListView: false,  // 是否显示选集界面
            showShareMenuView: false,  // 是否显示分享界面
            showSettingView: false, // 是否显示设置界面
        }
    }

    _renderVideoCoverImage() {
        const styleVideoCoverImage = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.state.videoWidth,
            height: this.state.videoHeight
        };

        return this.state.hasCover && this.state.showVideoCover ?
            <Image style={styleVideoCoverImage} source={{uri: this.state.videoCover}}/> : null;
    }

    _renderVideoTouchableCover() {
        const styleVideoCoverTouchable = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.state.videoWidth,
            height: this.state.videoHeight,
            backgroundColor: this.state.paused ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
        };

        return <TouchableWithoutFeedback onPress={this._onTapVideo}>
            <View style={styleVideoCoverTouchable}>
                {this._renderPlayButtonOfVideoTouchableCover()}
            </View>
        </TouchableWithoutFeedback>
    }

    _renderPlayButtonOfVideoTouchableCover() {
        if (!this.state.paused)
            return null;

        return (<TouchableWithoutFeedback onPress={this._onTapPlayButton}>
            <Image style={styles.playButton} source={require('./image/icon_video_play.png')}/>
        </TouchableWithoutFeedback>);
    }

    /**
     * 底部控制条渲染
     * 底部控制条从左向右依次是 :
     * 1.播放/暂停按钮，
     * 2.当前播放进度(时间),播放进度条(可拖拽改变进度),
     * 3.视频总时间长度,
     * 4.全屏切换按钮,
     * 5.高清选项按钮(全屏模式下显示)，
     * 6.选集选项按钮(全屏模式下显示)
     * 全屏模式和非全屏模式共用
     * @return {*}
     * @private
     */
    _renderBottomControlBar() {
        if (!this.state.showControlBar)
            return null;

        const styleBottomShadowImage = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.state.videoWidth,
            height: 50
        };

        return (<View style={[styles.bottomControl, {width: this.state.videoWidth}]}>
            <Image source={require('./image/img_bottom_shadow.png')} style={styleBottomShadowImage}/>
            {this._renderBottomControlBarPlayButton()}
            <Text style={styles.timeText}>{formatTime(this.state.currentTime)}</Text>
            {this._renderBottomControlBarProgressSlider()}
            <Text style={styles.timeText}>{formatTime(this.state.duration)}</Text>
            {this._renderBottomControlBarSwitchScreenButton()}
            {this._renderBottomControlBarOptionsForFullScreen()}
        </View>);
    }

    _renderBottomControlBarSwitchScreenButton() {
        if (!this.props.enableSwitchScreen)
            return null;

        const source = this.state.isFullScreen ? require('./image/icon_control_shrink_screen.png') : require('./image/icon_control_full_screen.png');
        return (<TouchableOpacity activeOpacity={0.3} onPress={this._onToggleFullScreen}>
            <Image style={styles.controlButtonSwitchScreen} source={source}/>
        </TouchableOpacity>);
    }

    /**
     * 底部控制条最右侧的选项按钮，仅在全屏模式出现 ： 高清 , 选集
     * @return {*}
     * @private
     */
    _renderBottomControlBarOptionsForFullScreen() {
        if (!this.state.isFullScreen)
            return null;

        return (<View style={styles.bottomOptionView}>
            <TouchableOpacity onPress={this._onTapDefinitionButton}>
                <Text style={styles.bottomOptionText}>高清</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this._onTapSelectVideo}>
                <Text style={[styles.bottomOptionText, {marginLeft: 10}]}>选集</Text>
            </TouchableOpacity>
        </View>);
    }

    /**
     * 底部控制条中的进度控制条
     * @return {*}
     * @private
     */
    _renderBottomControlBarProgressSlider() {
        return (<Slider
            style={{flex: 1}}
            maximumTrackTintColor={'#999999'}//滑块右侧轨道的颜色
            minimumTrackTintColor={'#00c06d'}//滑块左侧轨道的颜色
            thumbImage={require('./image/icon_control_slider.png')}
            value={this.state.currentTime}
            minimumValue={0}
            maximumValue={Number(this.state.duration)}
            onValueChange={this._onProgressSliderValueChange}
        />);
    }

    _renderBottomControlBarPlayButton() {
        return (<TouchableOpacity activeOpacity={0.3} onPress={this._onTapPlayButton}>
            <Image style={styles.controlButtonPlay}
                   source={this.state.paused ? require('./image/icon_control_play.png') : require('./image/icon_control_pause.png')}
            />
        </TouchableOpacity>);
    }

    _renderTopControlBar() {
        if (this.state.isFullScreen)
            return this._renderTopControlBarForFullScreen();
        else
            return this._renderTopControlBarForInline();
    }

    _renderTopControlBarForInline() {
        if (this.state.isFullScreen)
            return null;

        if (this.state.noBackButtonWhenInline)
            return null;

        const styleButtonBack = {
            position: 'absolute',
            top: 10,
            left: 10,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
        };

        return (
            <TouchableOpacity style={styleButtonBack} onPress={this._onTapBackButton}>
                <Image source={require('./image/icon_back.png')} style={{width: 26, height: 26}}/>
            </TouchableOpacity>
        );
    }

    _renderTopControlBarForFullScreen() {
        if (!this.state.isFullScreen)
            return null;

        if (!this.state.showControlBar)
            return null;

        const styleFullScreenTopControlBarContainer = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.state.videoWidth,
            height: 50,
            flexDirection: 'row',
            alignItems: 'center'
        };

        const styleFullScreenTopShadowImage = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.state.videoWidth,
            height: 50
        };

        return (
            <View style={styleFullScreenTopControlBarContainer}>
                <Image source={require('./image/img_top_shadow.png')} style={styleFullScreenTopShadowImage}/>
                <TouchableOpacity style={styles.backButton} onPress={this._onTapBackButton}>
                    <Image source={require('./image/icon_back.png')} style={{width: 26, height: 26}}/>
                </TouchableOpacity>
                <Text style={styles.videoTitle} numberOfLines={1}>{this.state.videoTitle}</Text>
                <View style={styles.topOptionView}>
                    <TouchableOpacity style={styles.topOptionItem} onPress={this._onTapCaptureImage}>
                        <Image source={require('./image/icon_video_capture.png')} style={{width: 26, height: 26}}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topOptionItem} onPress={this._onTapAirplayButton}>
                        <Image source={require('./image/icon_video_airplay.png')} style={styles.topImageOption}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topOptionItem} onPress={this._onTapShareButton}>
                        <Image source={require('./image/icon_video_share.png')} style={{width: 22, height: 22}}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topOptionItem} onPress={this._onTapMoreButton}>
                        <Image source={require('./image/icon_video_more.png')} style={styles.topImageOption}/>
                    </TouchableOpacity>
                </View>
            </View>);
    }

    /**
     * 全屏选项视图渲染，这些选项视图仅在全屏模式出现，并且同一时间只能出现一个
     * @return {*}
     * @private
     */
    _renderFullScreenOptionView() {
        if (!this.state.isFullScreen)
            return null;

        const styleOptionView = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: this.state.videoWidth,
            height: this.state.videoHeight,
        };

        if (this.state.showDefinitionView) {
            return (<SelectDefinitionView
                selectedIndex={2}
                style={styleOptionView}
                onItemSelected={(index) => this.onDefinitionItemSelected(index)}
                onCloseWindow={() => this.setState({showDefinitionView: false})}
            />);
        }

        if (this.state.showVideoListView) {
            return (<SelectVideoView
                currentVideo={this.state.videoUrl}
                style={styleOptionView}
                onItemSelected={(url) => this.onVideoListSwitch(url)}
                onCloseWindow={() => this.setState({showVideoListView: false})}
                videoList={this.props.videoList}
            />);
        }

        if (this.state.showShareMenuView) {
            return (<ShareOptionView
                style={styleOptionView}
                onShareItemSelected={(index) => this.onShareMenuPressed(index)}
                onCloseWindow={() => this.setState({showShareMenuView: false})}
            />);
        }
        if (this.state.showSettingView) {
            return (<MoreSettingView
                style={styleOptionView}
                isMuted={this.state.muted}
                volume={this.state.volume}
                selectedRate={this.state.playRate}
                selectedEndTimeIndex={0}
                onFavoriteTapped={() => this.setState({showSettingView: false})}
                onDownloadTapped={() => this.setState({showSettingView: false})}
                onMuteVolumeTapped={(isMute) => this.onMuteVolume(isMute)}
                onPlayRateChanged={(rate) => this.onPlayRateChange(rate)}
                onEndTimeSelected={(index) => this.onEndTimeChange(index)}
                onCloseWindow={() => this.setState({showSettingView: false})}
                onVolumeChange={(volume) => this.onVolumeChanged(volume)}
            />);
        }

        return null;
    }


    _renderVideoControl() {
        const styleVideoControl = {
            position: 'absolute',
            left: this.state.x,
            top: 0,
            width: this.state.videoWidth - 2 * this.state.x,
            height: this.state.videoHeight
        };

        return (<Video
            ref={(ref) => this.refVideo = ref}
            source={{uri: this.state.videoUrl}}
            resizeMode="contain"
            rate={this.state.playRate}
            volume={this.state.volume}
            muted={this.state.muted}
            ignoreSilentSwitch={"ignore"}
            style={styleVideoControl}
            paused={this.state.paused}
            onLoadStart={this._onLoadStart}
            onBuffer={this._onBuffering}
            onLoad={this._onLoad}
            onProgress={this._onProgressChange}
            onEnd={this._onPlayEnd}
            onError={this._onPlayError}
            playInBackground={false}
            playWhenInactive={false}
        />);
    }

    render() {
        const styleContainerDefault = {
            width: this.state.videoWidth,
            height: this.state.videoHeight,
            backgroundColor: '#000'
        };


        return (
            <View style={[styleContainerDefault, this.props.style]}>
                {this._renderVideoControl()}
                {this._renderVideoCoverImage()}
                {this._renderVideoTouchableCover()}
                {this._renderBottomControlBar()}
                {this._renderTopControlBar()}
                {this._renderFullScreenOptionView()}
            </View>
        )
    }

    /// -------播放器回调事件方法-------

    _onLoadStart = () => {
        console.log('视频开始加载...');
    };

    _onBuffering = () => {
        console.log('视频缓冲中...');
    };

    _onLoad = (data) => {
        console.log('视频加载完成');
        this.setState({
            duration: data.duration,
        });
    };

    //进度
    _onProgressChange = (data) => {
        if (!this.state.paused) {
            this.setState({
                currentTime: data.currentTime,
            })
        }
    };

    //视频播放结束触发的方法
    _onPlayEnd = () => {
        console.log('播放结束');
        this.setState({
            currentTime: 0,
            paused: true,
            playFromBeginning: true,
            showVideoCover: this.state.hasCover
        });
    };

    _onPlayError = () => {
        console.log('视频播放失败');
    };

    /**
     * 视频区域点击处理事件 : 用于控制显示或者隐藏控制条
     * @private
     */
    _onTapVideo = () => {
        let isShow = !this.state.showControlBar;
        this.setState({
            showControlBar: isShow,
        })
    };

    _onTapPlayButton = () => {
        let isPause = !this.state.paused;
        let isShowControl = false;
        if (!isPause) {
            isShowControl = true;
        }
        this.setState({
            paused: isPause,
            showControlBar: isShowControl,
            showVideoCover: false
        });
        if (this.state.playFromBeginning) {
            this.refVideo.seek(0);
            this.setState({
                playFromBeginning: false,
            })
        }
    };

    _onProgressSliderValueChange = (currentTime) => {
        this.refVideo.seek(currentTime);
        if (this.state.paused) {
            this.setState({
                paused: false,
                showVideoCover: false
            })
        }
    };

    // 点击展开全屏或收起全屏
    _onToggleFullScreen = () => {
        console.log("VideoPlayer 正在切换全屏播放模式:" + this.state.isFullScreen);
        this.props.onToggleFullScreen && this.props.onToggleFullScreen(this.state.isFullScreen);
    };

    // 点击返回键
    _onTapBackButton = () => {
        if (this.state.isFullScreen) {
            // 如果时全屏模式，将屏幕锁定为竖直方向就好
            Orientation.lockToPortrait();
        } else {
            // 如果不是全屏播放模式，使用外部指定的返回逻辑
            this.props.onTapBackButton && this.props.onTapBackButton();
        }
    };

    // 点击切换清晰度
    _onTapDefinitionButton = () => {
        this.setState({
            showDefinitionView: true,
            showControlBar: false
        })
    };

    // 点击选集
    _onTapSelectVideo = () => {
        this.setState({
            showVideoListView: true,
            showControlBar: false
        })
    };

    // 点击截屏
    _onTapCaptureImage = () => {

    };

    // 点击AirPlay
    _onTapAirplayButton = () => {

    };

    // 点击分享
    _onTapShareButton = () => {
        this.setState({
            showShareMenuView: true,
            showControlBar: false
        })
    };

    // 点击更多
    _onTapMoreButton = () => {
        this.setState({
            showSettingView: true,
            showControlBar: false
        })
    };

    onDefinitionItemSelected(index) {
        this.setState({
            showDefinitionView: false
        })
    }

    onVideoListSwitch(url) {
        this.updateVideo(url, 0, null);
        this.setState({
            showVideoListView: false
        })
    }

    onShareMenuPressed(index) {
        this.setState({
            showShareMenuView: false
        })
    }

    onMuteVolume(isMute) {
        let volume = this.state.volume;
        if (!isMute && volume === 0) {
            volume = 1.0;
        }
        this.setState({
            muted: isMute,
            volume: volume,
            showSettingView: false
        })
    }

    onPlayRateChange(rate) {
        this.setState({
            playRate: rate,
            showSettingView: false
        })
    }

    onEndTimeChange(index) {

    }

    onVolumeChanged(volume) {
        let isMute = (volume === 0);
        this.setState({
            volume: volume,
            muted: isMute
        })
    }

    /// --------外部调用方法--------

    updateVideo(videoUrl, seekTime, videoTitle) {
        let title = (videoTitle != null) ? videoTitle : this.state.videoTitle;
        this.setState({
            videoUrl: videoUrl,
            videoTitle: title,
            paused: false,
            showVideoCover: false,
        });
        this.refVideo.seek(seekTime);
    }

    updateLayout(width, height, isFullScreen) {
        let xPadding = 0;
        if (isFullScreen) {
            // 全屏模式下iPhone X左右两边需要留出状态栏的部分，避免视频被刘海遮住
            xPadding = isIPhoneX ? statusBarHeight : 0;
        }
        this.setState({
            x: xPadding,
            videoWidth: width,
            videoHeight: height,
            isFullScreen: isFullScreen
        }, () => {
            const prefix = "VideoPlayer updateLayout : 视频播放控件";
            console.log(prefix + (this.state.isFullScreen ? "进入全屏状态" : "退出全屏状态"))
        })
    }

    stop() {
        this.setState({
            paused: true,
            currentTime: 0
        })
    }
}

export function formatTime(second) {
    let h = 0, i = 0, s = parseInt(second);
    if (s > 60) {
        i = parseInt(s / 60);
        s = parseInt(s % 60);
    }
    // 补零
    let zero = function (v) {
        return (v >> 0) < 10 ? "0" + v : v;
    };
    return [zero(h), zero(i), zero(s)].join(":");
}

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;
export const defaultVideoHeight = screenWidth * 9 / 16;
export const isIPhoneX = DeviceInfo.isIPhoneX_deprecated;
export const statusBarHeight = isIPhoneX ? 44 : 20;
export const isSystemIOS = (Platform.OS === ' ios');

const styles = StyleSheet.create({
    playButton: {
        width: 50,
        height: 50,
    },
    bottomControl: {
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0
    },
    timeText: {
        fontSize: 13,
        color: 'white',
        marginLeft: 10,
        marginRight: 10
    },
    videoTitle: {
        fontSize: 14,
        color: 'white',
        flex: 1,
        marginRight: 10,
    },
    controlButtonPlay: {
        width: 24,
        height: 24,
        marginLeft: 15
    },
    controlButtonSwitchScreen: {
        width: 15,
        height: 15,
        marginRight: 15
    },
    backButton: {
        flexDirection: 'row',
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
    bottomOptionView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        height: 50
    },
    bottomOptionText: {
        fontSize: 14,
        color: 'white',
    },
    topOptionView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        height: 50
    },
    topOptionItem: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topImageOption: {
        width: 24,
        height: 24
    }
});