import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {onePixel} from "./MoreSettingView";

/**
 * 视频文件选择视图(选集视图)
 */
export default class SelectVideoView extends React.Component {

    static defaultProps = {
        currentVideo: null
    };

    static propTypes = {
        onItemSelected: PropTypes.func,
        onCloseWindow: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            currentVideo: this.props.currentVideo
        }
    }

    render() {
        const videoList = this.props.videoList ? this.props.videoList : [];
        return (
            <TouchableOpacity activeOpacity={1} style={[styles.container, this.props.style]}
                              onPress={this._onTapBackground}>
                <ScrollView contentContainerStyle={styles.optionView} showsVerticalScrollIndicator={false}>
                    {
                        videoList.map((item, index) => {
                            let isSelected = (this.state.currentVideo == item);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    style={[styles.optionItem, isSelected ? styles.optionItemActive : null]}
                                    onPress={() => this.onTapItemAtIndex(item)}
                                >
                                    <Text
                                        style={[styles.optionText, isSelected ? styles.optionTextActive : null]}>这是 :
                                        视频{index + 1}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
            </TouchableOpacity>
        )
    }

    _onTapBackground = () => {
        this.props.onCloseWindow && this.props.onCloseWindow();
    };

    onTapItemAtIndex(videoUrl) {
        this.setState({
            currentUrl: videoUrl
        });
        this.props.onItemSelected && this.props.onItemSelected(videoUrl);
    }

    updateVideo(url) {
        this.setState({
            currentUrl: url
        })
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionView: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionItem: {
        width: 200,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomWidth: onePixel,
        borderColor: 'white'
    },
    optionItemActive: {
        borderColor: '#ff5500',
    },
    optionText: {
        fontSize: 15,
        color: 'white'
    },
    optionTextActive: {
        color: '#ff5500'
    }
});