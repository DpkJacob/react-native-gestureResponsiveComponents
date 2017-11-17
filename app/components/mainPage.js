import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    PanResponder,
    Animated,
    Dimensions,
    Alert
} from 'react-native';


export default class MainPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            size: new Animated.Value(300),
            panLeft: new Animated.Value(0),
            panTop: new Animated.Value(0),
            angle:new Animated.Value(0),
        };
        this.data = {
            length: 0,
            imageX1: 0,
            imageY1: 0,
            imageX2: 0,
            imageY2: 0,
            prev: [],
            fingerDown: false,
            prevDx: 0,
            prevDy: 0,
            prevAngle:0,
            setAngle:0,
        };
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gState) => {
                
                if (event.nativeEvent.touches.length == 2) {
                    this.data.prevDx = gState.dx;
                    this.data.prevDy = gState.dy;
                    var x = event.nativeEvent.touches;
                    var diffX=x[0].pageX - x[1].pageX;
                    var diffY=x[0].pageY - x[1].pageY;
                    var diff = Math.pow(diffX, 2) + Math.pow(diffY, 2);
                    var newAngle=this.calcAngle(diffX,diffY);
                    if(Math.abs(newAngle-this.data.prevAngle)>3){
                        var diff;
                        if((newAngle<this.data.prevAngle)&&(newAngle>(this.data.prevAngle-90))){
                             diff=-(this.data.prevAngle-newAngle);
                        }
                        else if(newAngle>(90+this.data.prevAngle)){
                             diff=-(this.data.prevAngle+(180-newAngle));
                        }
                        else if(newAngle>this.data.prevAngle){
                            diff=newAngle-this.data.prevAngle;
                        }
                        else if(newAngle<(this.data.prevAngle-90)){
                            diff=newAngle+(180-this.data.prevAngle);
                        }
                        var change=this.state.angle._value+diff;
                        if(change<-360){
                            change+=360;
                        }
                        else if(change>360){
                            change-=360;
                        }
                        this.data.setAngle=change;
                        this.state.angle.setValue(change);
                        this.data.prevAngle=newAngle;
                    }
                    var l = Math.sqrt(diff);
                    if (l > this.data.length) {
                        this.zoomIn(x);
                    }
                    else {
                        this.zoomOut(x);
                    }
                    this.data.length = l;
                   
                }
                else if (event.nativeEvent.touches.length == 1) {
                    var diffDx = gState.dx - this.data.prevDx;
                    var diffDy = gState.dy - this.data.prevDy;
                    var left=this.state.panLeft._value + diffDx;
                    var top=this.state.panTop._value + diffDy;
                    this.state.panLeft.setValue(left);
                    this.state.panTop.setValue(top);
                    this.data.imageX1+= diffDx;
                    this.data.imageX2+= diffDx;
                    this.data.imageY1+= diffDy;
                    this.data.imageY2+= diffDy;
                    this.data.prevDx = gState.dx;
                    this.data.prevDy = gState.dy;

                }


            },
            onPanResponderStart: (e, g) => {
                if (e.nativeEvent.touches.length == 2) {
                    this.data.prevDx = 0;
                    this.data.prevDy = 0;
                    var x = e.nativeEvent.touches;
                    var yDiff=x[0].pageY - x[1].pageY;
                    var xDiff=x[0].pageX - x[1].pageX;
                    var diff = Math.pow(xDiff, 2) + Math.pow(yDiff, 2);
                    this.data.length = Math.sqrt(diff);
                    this.data.prev = e.nativeEvent.touches;
                    this.data.prevAngle=this.calcAngle(xDiff,yDiff);
                }
                else if (e.nativeEvent.touches.length == 1) {
                    this.data.prevDx = 0;
                    this.data.prevDy = 0;
                }
            },
            onPanResponderRelease: () => {
                this.data.length = 0;
                this.data.prevDx = 0;
                this.data.prevDy = 0;
            }
        });

    }
    componentDidMount() {
        this.data.imageX1 = (Dimensions.get('window').width / 2) - (this.state.size._value / 2);
        this.data.imageX2 = this.data.imageX1 + (this.state.size._value);
        this.data.imageY1 = (Dimensions.get('window').height / 2) - (this.state.size._value / 2);
        this.data.imageY2 = this.data.imageY1 + (this.state.size._value);
    }

    calcAngle(difX,difY){
        var slope=difY/difX;
        var angle=Math.atan(slope) * 180 / Math.PI;
        angle<0?angle+=180:angle;
        return angle;
    }

    zoomIn(x) {
        if (Math.abs(x[0].pageX - x[1].pageX) > (Math.abs(x[0].pageY - x[1].pageY))) {
            var imageLeft,imageRight
            if (this.data.prev[0].pageX < this.data.prev[1].pageX) {
                var imageLeft = this.data.prev[0].pageX;
                var imageRight = this.data.prev[1].pageX;
            }
            else{
                var imageLeft = this.data.prev[1].pageX;
                var imageRight = this.data.prev[0].pageX;
            }
            this.widthZoom(x,imageLeft,imageRight);
        }
        else {
            var imageTop,imageBottom;
             if (this.data.prev[0].pageY < this.data.prev[1].pageY) {
                 imageTop = this.data.prev[0].pageY;
                 imageBottom = this.data.prev[1].pageY;
            }
            else{
                imageTop = this.data.prev[1].pageY;
                imageBottom = this.data.prev[0].pageY;
            }
            this.heightZoom(x,imageTop,imageBottom);
        }
    };

    widthZoom(x,imageLeft,imageRight) {
        var x1, x2;
        if (x[0].pageX < x[1].pageX) {
            x1 = x[0].pageX;
            x2 = x[1].pageX;
        }
        else {
            x1 = x[1].pageX;
            x2 = x[0].pageX;
        }
        if (x1 < imageLeft && x2 > imageRight) {
            var dist = (imageLeft - x1) + (x2 - imageRight);
            var newSize = this.state.size._value + dist;
            var left = (dist/2) - (imageLeft - x1) + this.state.panLeft._value;
            this.state.size.setValue(newSize);
            this.state.panLeft.setValue(left);
            this.data.prev=x;
        }
        else if (x1 < imageLeft) {
            var dist = imageLeft - x1;
            var newSize = this.state.size._value + dist;
            var left = this.state.panLeft._value - (dist / 2);
            this.state.size.setValue(newSize);
            this.state.panLeft.setValue(left);
            this.data.prev=x;
        }
        else if (x2 > imageRight) {
            var dist = x2 - imageRight;
            var newSize = this.state.size._value + dist;
            var left = this.state.panLeft._value + (dist / 2);
            this.state.size.setValue(newSize);
            this.state.panLeft.setValue(left);
            this.data.prev=x;
        }

    };

    heightZoom(x,imageTop,imageBottom) {
        var y1, y2;
        if (x[0].pageY < x[1].pageY) {
            y1 = x[0].pageY;
            y2 = x[1].pageY;
        }
        else {
            y1 = x[1].pageY;
            y2 = x[0].pageY;
        }
        if (y1 < imageTop && y2 > imageBottom) {    
            var dist = (imageTop - y1) + (y2 - imageBottom);
            var newSize = this.state.size._value + dist;
            var top = (dist / 2) - (imageTop - y1) + this.state.panTop._value;
            this.state.size.setValue(newSize);
            this.state.panTop.setValue(top);
            this.data.prev=x;
        }
        else if (y1 < imageTop) {
            var dist = imageTop - y1;
            var newSize = this.state.size._value + dist;
            var top = this.state.panTop._value - (dist / 2);
            this.state.size.setValue(newSize);
            this.state.panTop.setValue(top);
            this.data.prev=x;
        }
        else if (y2 > imageBottom) {
            var dist = y2 - imageBottom;
            var newSize = this.state.size._value + dist;
            var top = this.state.panTop._value + (dist / 2);
            this.state.size.setValue(newSize);
            this.state.panTop.setValue(top);
            this.data.prev=x;
        }
    };

    zoomOut(x) {
        if (Math.abs(x[0].pageX - x[1].pageX) > (Math.abs(x[0].pageY - x[1].pageY))) {
            if (this.data.prev[0].pageX < this.data.prev[1].pageX) {
                var imageLeft = this.data.prev[0].pageX;
                var imageRight = this.data.prev[1].pageX;
                this.widthZoomOut(x, imageLeft, imageRight);
            }
            else {
                var imageLeft = this.data.prev[1].pageX;
                var imageRight = this.data.prev[0].pageX;
                this.widthZoomOut(x, imageLeft, imageRight);
            }
        }
        else {
            if (this.data.prev[0].pageY < this.data.prev[1].pageY) {
                var imageTop = this.data.prev[0].pageY;
                var imageBottom = this.data.prev[1].pageY;
                this.heightZoomOut(x, imageTop, imageBottom);
            }
            else {
                var imageTop = this.data.prev[1].pageY;
                var imageBottom = this.data.prev[0].pageY;
                this.heightZoomOut(x, imageTop, imageBottom);
            }
        }
    };

    widthZoomOut(x, imageLeft, imageRight) {
        var x1, x2;
        if (x[0].pageX < x[1].pageX) {
            x1 = x[0].pageX;
            x2 = x[1].pageX;
        }
        else {
            x1 = x[1].pageX;
            x2 = x[0].pageX;
        }

        if (x1 > imageLeft && x2 < imageRight) {
            var dist = (x1 - imageLeft) + (imageRight - x2);
            var newSize = this.state.size._value - dist;
            var left = (x1 - imageLeft) - (dist / 2) + this.state.panLeft._value;
            this.data.prev = x;
            this.state.size.setValue(newSize);
            this.state.panLeft.setValue(left);
        }
        else if (x1 > imageLeft) {
            var dist = (x1 - imageLeft);
            var newSize = this.state.size._value - dist;
            var left = (dist / 2) + this.state.panLeft._value;
            this.data.prev = x;
            this.state.size.setValue(newSize);
            this.state.panLeft.setValue(left);
        }
        else if (x2 < imageRight) {
            var dist = (imageRight - x2);
            var newSize = this.state.size._value - dist;
            var left = this.state.panLeft._value - (dist / 2);
            this.data.prev = x;
            this.state.size.setValue(newSize);
            this.state.panLeft.setValue(left);
        }
    };

    heightZoomOut(x, imageTop, imageBottom) {
        var y1, y2;
        if (x[0].pageY < x[1].pageY) {
            y1 = x[0].pageY;
            y2 = x[1].pageY;
        }
        else {
            y1 = x[1].pageY;
            y2 = x[0].pageY;
        }

        if (y1 > imageTop && y2 < imageBottom) {
            var dist = (y1 - imageTop) + (imageBottom - y2);
            var newSize = this.state.size._value - dist;
            var top = (y1 - imageTop) - (dist / 2) + this.state.panTop._value;
            this.data.prev = x;
            this.state.size.setValue(newSize);
            this.state.panTop.setValue(top);
        }
        else if (y1 > imageTop) {
            var dist = (y1 - imageTop);
            var newSize = this.state.size._value - dist;
            var top = (dist / 2) + this.state.panTop._value;
            this.data.prev = x;
            this.state.size.setValue(newSize);
            this.state.panTop.setValue(top);
        }
        else if (y2 < imageBottom) {
            var dist = (imageBottom - y2);
            var newSize = this.state.size._value - dist;
            var top = this.state.panTop._value - (dist / 2);
            this.data.prev = x;
            this.state.size.setValue(newSize);
            this.state.panTop.setValue(top);
        }

    };

    render() {
        return (
            <View style={styles.container}>
            <Animated.Image   {...this._panResponder.panHandlers} source={require('../images/shades.png')}  style={[{ top: this.state.panTop, left: this.state.panLeft, height: this.state.size, width: this.state.size,transform:[{rotate:this.state.angle.interpolate({
                 inputRange:[-360,360],
                outputRange:['-360deg','360deg']
            })}]},styles.bg_red]} onLayout={(event)=>{}} collapsable={false} resizeMode='contain' />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    bg_red:{
        backgroundColor:'red'
    }
});