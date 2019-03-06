# react-carousel-comp

A light-weight React react-carousel-comp component with extremely easy API（只适用于移动端项目）. [Online Demo](https://shenxuxiang.github.io/react-carousel-comp/), welcome [code review](https://github.com/shenxuxiang/react-carousel-comp)
## Installation

```sh
npm install react-carousel-comp --save
```

## Usage

```js

import img1 from './static/images/11.jpg';
import img2 from './static/images/12.jpg';
import img3 from './static/images/13.jpg';
import img4 from './static/images/14.jpg';
import img5 from './static/images/15.jpg';
import Carousel from './Carousel';

// 屏幕宽度
const screenWidth = window.screen.width ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

const SOURCE = [img1, img2, img3, img4, img5];
export default class App extends PureComponent {
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
      </div>
    );
  }
}
```


## props

| param            | detail                                         | type     | default         |
| ---------------- | -----------------------------------------------| -------- | -------         |
| children         | collection of child nodes,                     | array    | []              |
| width            | components width, isRequiored                  | number   |                 |
| className        | components className, isRequiored              | string   |                 |
| style            | components style                               | object   | null            |
| index            | display the index in the children when initializing, starting from 1                                                                   | number   | 1               |
| timer            | carousel time                                  | number   | 4000            |
| infinite         | whether to loop                                | bool     | true            |
| speed            | speed of animation                             | number   | 10              |
| indicatorClass   | indicator className                            | string   | ''              |
| visibleIndicator | whether to display the indicator               | bool     | true            |
