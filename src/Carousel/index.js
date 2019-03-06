import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Tween } from './utils';
import './index.less';
/* eslint-disable */
(function() {
  let lastTime = 0;
  const vendors = ['webkit', 'moz'];
  // 兼容，添加浏览器前缀
  for (let i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
    window.requestAnimationFrame = window[`${vendors[i]}RequestAnimationFrame`];
    window.cancelAnimationFrame = window[`${vendors[i]}CancelAnimationFrame`] ||
      // Webkit中此取消方法的名字变了
      window[`${vendors[i]}CancelRequestAnimationFrame`];
  }
  // 当浏览器不支持原生时使用setTimeout作为代替
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      const currentTime = new Date().getTime();
      // 第一次调用时是立即执行
      // 如果callback执行的时间超过16ms，那么timeToCall=0
      // 如果callback执行的时间不超过16ms，那么timeToCall=16-执行的时间
      // 这样设计的原因是为了确保两次callback执行的时间间隔最少是16ms
      const timeToCall = Math.max(0, 16 - (currentTime - lastTime));
      const id = setTimeout(() => callback(), timeToCall);
      lastTime = currentTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
})();
/* eslint-enable */

// 预设距离
const DISTX = 80;
// 最小预设距离
const MINDISTY = 20;
// 预设时间
const DURATION = 200;

export default class Carousel extends PureComponent {
  static propTypes = {
    // 组件的宽度
    width: PropTypes.number.isRequired,
    // carousel的className
    className: PropTypes.string.isRequired,
    // 组件的样式
    style: PropTypes.object,
    // 当前所展示的图片是第几张
    index: PropTypes.number,
    // 循环播放的间隔时间
    timer: PropTypes.number,
    // 子元素
    children: PropTypes.array,
    // 是否循环播放定时器
    infinite: PropTypes.bool,
    // 动画的functiontiming
    speed: PropTypes.number,
    // 指示器的class名
    indicatorClass: PropTypes.string,
    // 是否展示指示器
    visibleIndicator: PropTypes.bool,
  }

  static defaultProps = {
    style: null,
    index: 1,
    timer: 4000,
    children: [],
    infinite: true,
    speed: 10,
    indicatorClass: '',
    visibleIndicator: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      length: props.children.length,
      index: props.index,
    };
    this.wrapper = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { children } = nextProps;
    if (children !== prevState.children) {
      return { length: children.length };
    }
    return null;
  }

  componentDidMount() {
    this.props.infinite && this.startInterval();
  }

  startInterval = () => {
    this.timer = setInterval(() => {
      const { index } = this.state;
      this.animation(index + 1);
    }, this.props.timer);
  }

  endInterval = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  handleTouchStart = (event) => {
    this.endInterval();
    this.startTime = new Date().getTime();
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.sliderStatus = 'running';
    this.currentPos = null;
    this.offsetX = null;
    this.offsetY = null;
  }

  handleTouchMove = (event) => {
    const { index } = this.state;
    const { width: screenWidth } = this.props;
    const { clientX, clientY } = event.changedTouches[0];
    this.offsetX = clientX - this.startX;
    this.offsetY = clientY - this.startY;
    // 在滑动一开始就开始判断xy方向的偏移量，当x方向的偏移量大于y方向时，就会保持这个状态直到touchEnd结束
    // 当y方向的偏移量大于x方向时，就会保持这个状态直到touchEnd结束
    if (Math.abs(this.offsetX) >= Math.abs(this.offsetY) && this.sliderStatus === 'running') {
      // 当横向滑动时，阻止默认行为和冒泡
      event.preventDefault();
      event.stopPropagation();
      this.sliderStatus = 'horizontal';
    } else if (Math.abs(this.offsetX) < Math.abs(this.offsetY) && this.sliderStatus === 'running') {
      this.sliderStatus = 'vertical';
    }

    // 当判断出是y方向的移动时，就不会执行下面操作
    if (this.sliderStatus === 'vertical') return;

    // 如果动画还没有结束，那么就结束动画，并从动画当前位置开始计算偏移量
    if (this.animationTimer) {
      cancelAnimationFrame(this.animationTimer);
      this.animationTimer = null;
      this.currentPos = this.dist + this.offsetX;
    } else {
      // 轮播图跟随手指方向移动,表示当前所在的位置
      this.currentPos = -index * screenWidth + this.offsetX;
    }

    this.wrapper.style.transform = `translate3d(${this.currentPos}px, 0, 0)`;
    this.wrapper.style.webkitTransform = `translate3d(${this.currentPos}px, 0, 0)`;
  }

  handleTouchEnd = () => {
    // 当没有触发touchMove，或者判断出是y方向的滑动时，不会进行任何操作，并初始化滑动状态
    if (this.offsetX == null || this.sliderStatus === 'vertical') {
      this.props.infinite && this.startInterval();
      return;
    }

    const { index } = this.state;
    // 计算手指滑动的时间
    const duration = new Date().getTime() - this.startTime;
    // 当滑动过程持续的时间小于预设时间时
    if (duration <= DURATION) {
      if (this.offsetX > MINDISTY) {
        this.animation(index - 1);
      } else if (this.offsetX < -MINDISTY) {
        this.animation(index + 1);
      } else if (this.offsetX <= MINDISTY && this.offsetX >= -MINDISTY) {
        this.animation(index);
      }
    } else if (duration > DURATION) {
      // 向右滑动
      if (this.offsetX >= DISTX) {
        this.animation(index - 1);
      } else if (this.offsetX > 0 && this.offsetX < DISTX) {
        this.animation(index);
      } else if (this.offsetX <= -DISTX) {
        this.animation(index + 1);
      } else if (this.offsetX > -DISTX && this.offsetX < 0) {
        this.animation(index);
      }
    }
    this.props.infinite && this.startInterval();
  }

  animation = (idx) => {
    const { index, length } = this.state;
    const { width: screenWidth, speed } = this.props;
    // 动画执行的次数
    let start = 0;
    // 动画当前所处的位置
    const currentPos = this.currentPos || -index * screenWidth;
    // 动画的偏移量 = 目标位置 - 当前位置
    const offset = -idx * screenWidth - currentPos;
    // 动画会执行多少次，取整
    const during = Math.abs(offset) / speed;
    const run = () => {
      start += 1;
      this.dist = Math.ceil(Tween.easeOut(start, currentPos, offset, during));
      if (start + 1 >= during) {
        this.dist = -idx * screenWidth;
      }
      this.wrapper.style.transform = `translate3d(${this.dist}px, 0, 0)`;
      this.wrapper.style.webkitTransform = `translate3d(${this.dist}px, 0, 0)`;
      if (start < during) {
        this.animationTimer = requestAnimationFrame(run);
      } else {
        cancelAnimationFrame(this.animationTimer);
        this.animationTimer = null;
      }
    };

    let currentIndex = idx;
    if (currentIndex === 0) {
      currentIndex = length;
    } else if (currentIndex === length + 1) {
      currentIndex = 1;
    }
    // 动画不能和this.setState同时进行，放在其回调函数后再进行动画，否则会有卡顿和图片闪烁
    this.setState({ index: currentIndex }, () => run());
  }

  render() {
    const { length, index } = this.state;
    const {
      width,
      children,
      className,
      style,
      indicatorClass,
      visibleIndicator,
    } = this.props;
    return (
      <div
        className={`react-carousel ${className}`}
        style={{ style }}
      >
        <div
          ref={ref => this.wrapper = ref}
          className="react-carousel-wrapper"
          style={{
            width: `${(length + 2) * width}px`,
            transform: `translate3d(${-index * width}px, 0, 0)`,
            WebkitTransform: `translate3d(${-index * width}px, 0, 0)`,
          }}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
        >
          {
            React.Children.map(children, (child, idx) => {
              if (idx >= length - 1) {
                return (
                  <div
                    key="react-carousel-comp-first"
                    className="react-carousel-wrapper-item"
                    style={{ width }}
                  >
                    {child}
                  </div>
                );
              }
            })
          }
          {
            React.Children.map(children, (child, idx) =>
              <div
                // eslint-disable-next-line
                key={idx}
                className="react-carousel-wrapper-item"
                style={{ width }}
              >
                {child}
              </div>
            )
          }
          {
            React.Children.map(children, (child, idx) => {
              if (idx <= 0) {
                return (
                  <div
                    key="react-carousel-comp-last"
                    className="react-carousel-wrapper-item"
                    style={{ width }}
                  >
                    {child}
                  </div>
                );
              }
            })
          }
        </div>
        <div className={`react-carousel-indicator ${indicatorClass}`}>
          {
            visibleIndicator && children.map((item, key) =>
              <div
                // eslint-disable-next-line
                key={key}
                className={`react-carousel-indicator-item ${key === index - 1 ? 'active' : ''}`}
              />
            )
          }
        </div>
      </div>
    );
  }
}
