import React, { PureComponent } from 'react';
import img1 from './static/images/11.jpg';
import img2 from './static/images/12.jpg';
import img3 from './static/images/13.jpg';
import img4 from './static/images/14.jpg';
import img5 from './static/images/15.jpg';
import Carousel from './Carousel';
import './app.css';

// 屏幕宽度
const screenWidth = window.screen.width ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

const SOURCE = [img1, img2, img3, img4, img5];
export default class App extends PureComponent {
  constructor() {
    super();
    this.state = {
    };
  }

  render() {
    return (
      <div className="container">
        <Carousel
          index={1}
          timer={5000}
          width={screenWidth}
          infinite={true}
          className="carousel"
        >
          {
            SOURCE.map((item, key) =>
              <a
                href="javascript:;"
                className="carousel-item-a"
                key={key}
              >
                <img
                  src={item}
                  alt="轮播图"
                  className="carousel-item-a-img"
                />
              </a>
            )
          }
        </Carousel>
        <div>请使用移动设备查看demo演示</div>
      </div>
    );
  }
}
