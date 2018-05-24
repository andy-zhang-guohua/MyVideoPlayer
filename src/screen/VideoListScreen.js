import React from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Orientation from "react-native-orientation";
import {statusBarHeight} from "../widgets/videoPlayer/VideoPlayer";
import OverlayVideoPlayer from "../widgets/videoPlayer/OverlayVideoPlayer";

export const videoList = [
    "http://wvideo.spriteapp.cn/video/2016/0328/56f8ec01d9bfe_wpd.mp4",
    "http://bbt.lcedu.net:8810/SD/2017qingdao/xiaoxueshuxue/grade1/1.mp4",
    "http://bbt.lcedu.net:8810/SD/2017qingdao/xiaoxueEnglish/grade1/b/1.mp4",
    "http://bbt.lcedu.net:8810/SD/2017qingdao/xiaoxueEnglish/grade2/b/1.mp4",
    "http://bbt.lcedu.net:8810/SD/2017qingdao/xiaoxueshuxue/grade2/1.mp4",
    "http://bbt.lcedu.net:8810/SD/2017qingdao/xiaoxueEnglish/grade5/b/1.mp4",
    "http://bbt.lcedu.net:8810/SD/2017qingdao/xiaoxueshuxue/grade5/1.mp4",
    "http://bbt.lcedu.net:8810/SD/2017qingdao/xiaoxueEnglish/grade3/a/1.mp4",
    "http://upload.lcedu.net/data/uploads/2018/0409/17/9c9b0c15-bdd7-4fd7-babc-75fc51e28497.mp4"
];

export default class VideoListScreen extends React.Component {

    static navigationOptions = ({navigation}) => ({
        headerTitle: (navigation.state.routeName === 'Mode1') ? '列表模式' : '全屏模式',
    });


    static navigationOptions = ({navigation}) => {
        const params = navigation.state.params || {};
        if (params.isFullScreenVideo) {
            return {
                header: null,// hide header
                tabBarVisible: false, // hide tab bar
            }
        }

        return {
            headerTitle: (navigation.state.routeName === 'Mode1') ? '列表模式' : '全屏模式',
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            currentUrl: '',
            showOverlayVideoPlayer: false,
        };


        this._toggleOverlayVideoPlayer = this._toggleOverlayVideoPlayer.bind(this);
        this._hideOverlayVideoPlayer = this._hideOverlayVideoPlayer.bind(this);
        this._onVideoFullScreenChange = this._onVideoFullScreenChange.bind(this);

        Orientation.lockToPortrait();
    }


    _toggleOverlayVideoPlayer(targetShow, url) {
        if (targetShow) {
            Orientation.unlockAllOrientations();
        }
        else {
            Orientation.lockToPortrait();
        }
        this.setState({showOverlayVideoPlayer: targetShow, currentUrl: url});
    }

    render() {
        const overlayVideoPlayer = (this.state.showOverlayVideoPlayer) ? this._renderOverlayVideoPlayer() : null;

        return (<View style={{flex: 1}}>
            <FlatList data={videoList} renderItem={this._renderRow} keyExtractor={(item) => item}/>
            {overlayVideoPlayer}
        </View>)
    }

    _hideOverlayVideoPlayer() {
        this._toggleOverlayVideoPlayer(false);
    }

    _renderOverlayVideoPlayer() {
        return (
            <OverlayVideoPlayer
                url={this.state.currentUrl}
                onTapBackButton={this._hideOverlayVideoPlayer}
                onFullScreenChange={this._onVideoFullScreenChange}
            />);
    }

    _onVideoFullScreenChange(isFullScreen) {
        this.props.navigation && this.props.navigation.setParams({isFullScreenVideo: isFullScreen});
        this.forceUpdate();
    }

    _renderRow = (item) => {
        let url = item.item;
        return (
            <TouchableHighlight underlayColor={'#dcdcdc'} onPress={() => {
                this.itemSelected(url)
            }}>
                <View style={styles.itemContainer}>
                    <Text style={styles.title}>视频{item.index + 1}</Text>
                    <Image source={require('../image/icon_right.png')} style={styles.rightIcon}/>
                </View>
            </TouchableHighlight>
        )

    };

    itemSelected(url) {
        if (this.props.navigation.state.routeName === 'Mode1') {
            this.props.navigation.navigate('InlinePlayer', {url});
            //this.props.navigation.navigate('OverlayPlayer', {url, videoList});
            //this._toggleOverlayVideoPlayer(true, url);
        } else {
            this.props.navigation.navigate('FullScreenPlayer', {url: url});
        }
    }
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#dcdcdc'
    },
    title: {
        fontSize: 16,
        color: '#000',
        flex: 1
    },
    title_active: {
        color: '#00c08d'
    },
    rightIcon: {
        width: 15,
        height: 15
    },
    statusBarView: {
        backgroundColor: '#000',
        height: statusBarHeight,
    }
});