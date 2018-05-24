#2018-05-24
- 尝试使用整个react-navigation屏幕作为一个播放器，竖屏时放在中间(其他部分透明)，横屏时全屏，
    - 问题 : 没有找到 react-navigation 屏幕背景透明的方法，使用  cardStyle: { backgroundColor: 'transparent' } 出现黑色背景
#2018-05-23

开始项目

- widgets/videoPlayer/VideoPlayer.js 自定义视频播放控件,基于 react-native-video 视频播放控件的封装，增加更多UI控制功能
- screen/InlinePlayScreen.js 基于以上自定义视频播放控件 + react-navigation 的视频播放演示
    - 缺省为竖屏模式 : 导航头部,视频控件，视频选择列表
    - 此屏幕下允许横屏竖屏切换
    - 竖屏转成横屏时会自动切换成全屏播放模式
    - 横屏转回竖屏时自动复原缺省模式
    - 横屏竖屏切换过程中视频播放效果不中断(同一实例，继续播放)
    - 横屏全屏播放时屏幕导航头部消失，播放控件拦截返回事件并处理
    - 当前问题 :
        - 横屏竖屏切换时屏幕切换不流畅，(对比例子:爱奇艺视频)
        - 播放器的全屏切换按钮不工作 (似乎进入目标模式后马上又退出了)
        - 如果 react-navigation header 不为 null, 转屏时播放器 onLayout 会被调用两次，因为所在容器视图会被渲染两次
- screen/FullScreenPlayScreen.js 直接基于 react-native-video 视频播放控件的全屏播放演示