import { useState, useEffect, ChangeEvent } from 'react';
import Slider from '@mui/material/Slider';
import Jimp from 'jimp/es';
import './ImageTest.css';
const ImageTest3 = () => {
  const [imageTest, setImageTest] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>(
    { width: 0, height: 0 }
  );

  const [rLimit, setRLimit] = useState(0);
  const [rotate, setRotate] = useState(0);

  const onChange = (e: any) => {
    setImageTest(URL.createObjectURL(e.target.files[0]));
  };

  const handleInputChange = (e: any) => {
    setRLimit(e.target.value);
  };

  const spinRight = (e: any) => {
    const newRotate = rotate + 90;
    setRotate(newRotate === 360 ? 0 : newRotate);
  };

  let rectangles: any[] = [];
  let dots: any[] = [];

  let startX = 0;
  let startY = 0;
  const marqueeRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  const hitTest = (x: number, y: number) => {
    return rectangles.find(
      (rect) =>
        x >= rect.x &&
        y >= rect.y &&
        x <= rect.x + rect.width &&
        y <= rect.y + rect.height
    );
  };

  const redraw = () => {
    const boxes = document.getElementById('boxes');
    if (boxes) {
      boxes.innerHTML = '';
      rectangles.forEach((data) => {
        boxes.appendChild(
          drawRect(
            document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
            data
          )
        );
      });
      console.log('???? ', dots);
      dots.forEach((data) => {
        boxes.appendChild(
          drawDot(
            document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
            data
          )
        );
      });
    }
  };

  const resetRectangles = () => {
    dots = [];
    rectangles = [];
    redraw();
  };

  function drawDot(dot: any, data: any) {
    if (dot) {
      const { x, y } = data;
      dot.setAttributeNS(null, 'cx', x);
      dot.setAttributeNS(null, 'cy', y);
      dot.setAttributeNS(null, 'r', 3);
    }
    return dot;
  }

  function drawRect(rect: any, data: any) {
    if (rect) {
      const { x, y, width, height } = data;
      rect.setAttributeNS(null, 'width', width);
      rect.setAttributeNS(null, 'height', height);
      rect.setAttributeNS(null, 'x', x);
      rect.setAttributeNS(null, 'y', y);
    }
    return rect;
  }

  function stopDrag(ev: any) {
    const marquee = document.getElementById('marquee');
    const afterImage = document.getElementById('afterImage');
    if (marquee && afterImage) {
      marquee.classList.add('hide');
      window.removeEventListener('pointerup', stopDrag);
      afterImage.removeEventListener('pointermove', moveDrag);
      if (ev.target === afterImage && marqueeRect.width && marqueeRect.height) {
        rectangles.push(Object.assign({}, marqueeRect));
        redraw();
      }
    }
  }

  function moveDrag(ev: any) {
    let x = ev.layerX;
    let y = ev.layerY;
    let width = startX - x;
    let height = startY - y;
    if (width < 0) {
      width *= -1;
      x -= width;
    }
    if (height < 0) {
      height *= -1;
      y -= height;
    }
    Object.assign(marqueeRect, { x, y, width, height });
    drawRect(document.getElementById('marquee'), marqueeRect);
  }

  const findRectRegion = (x: number, y: number) => {
    return rectangles.find((rect, index) => {
      const { x: rectX, y: rectY, width, height } = rect;
      return (
        rectX <= x && x <= rectX + width && rectY <= y && y <= rectY + height
      );
    });
  };

  const startDrag = (e: any) => {
    const marquee = document.getElementById('marquee');
    const afterImage = document.getElementById('afterImage');
    if (e.button === 0) {
      let firstDragAction = true;
      const result = findRectRegion(e.layerX, e.layerY);
      if (result) {
        if (marquee && afterImage) {
          const resultIndex = rectangles.indexOf(result);

          rectangles.splice(resultIndex, 1);
          const stopMoveRectangleDrag = (ev: any) => {
            const marquee = document.getElementById('marquee');
            const afterImage = document.getElementById('afterImage');
            if (marquee && afterImage) {
              marquee.classList.add('hide');
              window.removeEventListener('pointerup', stopMoveRectangleDrag);
              afterImage.removeEventListener('pointermove', moveRectangle);
              if (
                ev.target === afterImage &&
                marqueeRect.width &&
                marqueeRect.height
              ) {
                redraw();
              }
            }
          };

          const moveRectangle = (ev: any) => {
            const newRect = {
              ...result,
              x: ev.layerX - result.width / 2,
              y: ev.layerY - result.height / 2,
            };
            if (!firstDragAction) {
              rectangles.pop();
            }
            rectangles.push(newRect);

            Object.assign(marqueeRect, newRect);
            drawRect(document.getElementById('marquee'), marqueeRect);
            redraw();
            firstDragAction = false;
          };

          window.addEventListener('pointerup', stopMoveRectangleDrag);
          afterImage.addEventListener('pointermove', moveRectangle);
          // marquee.classList.remove('hide');
          // startX = e.layerX;
          // startY = e.layerY;
        }
      } else {
        if (marquee && afterImage) {
          window.addEventListener('pointerup', stopDrag);
          afterImage.addEventListener('pointermove', moveDrag);
          marquee.classList.remove('hide');
          startX = e.layerX;
          startY = e.layerY;
        }
      }
    }
    if (e.button === 1) {
      const rect = hitTest(e.layerX, e.layerY);
      if (rect) {
        rectangles.splice(rectangles.indexOf(rect), 1);
        redraw();
      }
      return;
    }

    // if (marquee && afterImage) {
    //   window.addEventListener('pointerup', stopDrag);
    //   afterImage.addEventListener('pointermove', moveDrag);
    //   marquee.classList.remove('hide');
    //   startX = e.layerX;
    //   startY = e.layerY;
    // }
  };

  const getDot = (ev: any) => {
    if (ev.button === 0) {
      console.log('!! ', ev.layerX, ev.layerY);
      dots.push({ x: ev.layerX, y: ev.layerY });
      redraw();
    }
  };

  useEffect(() => {
    document.getElementById('marquee')?.classList.add('hide');
    document
      .getElementById('afterImage')
      ?.addEventListener('pointerdown', startDrag);
    document.getElementById('afterImage')?.addEventListener('dblclick', getDot);
  }, [afterImage]);

  useEffect(() => {
    if (imageTest) {
      Jimp.read(imageTest)
        .then((image) => {
          console.log('bitmap? ', image.bitmap);
          setImageSize({
            width: image.bitmap.width,
            height: image.bitmap.height,
          });

          image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(
            x,
            y,
            idx
          ) {
            // do your stuff..
            const pixelColorHex = image.getPixelColor(x, y);
            const rgba = Jimp.intToRGBA(pixelColorHex);

            /* R을 모두 0으로 START */
            // const newRgba = { ...rgba, r: 0 };
            const newRgba = rgba.r > rLimit ? { ...rgba, r: 0 } : rgba;
            /* R을 모두 0으로 END */

            /* R 정도를 white로 대체 START */
            // const {r,g,b,a} = rgba
            // const mix = r /255;
            // const calcG =g*(1-mix)+255*mix;
            // const newG = calcG < 0? 0 : calcG >255 ? 255 : calcG;
            // const calcB = b*(1-mix)+255*mix
            // const newB = calcB< 0? 0 : calcB>255 ? 255 : calcB;
            //  const newRgba = {r: 255*mix, g: newG, b: newB, a : a }
            /* R 정도를 white로 대체 END */

            const newHex = Jimp.rgbaToInt(
              newRgba.r,
              newRgba.g,
              newRgba.b,
              newRgba.a
            );
            image.setPixelColor(newHex, x, y);

            if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
              // image scan finished, do your stuff
            }
          });

          image.rotate(rotate);

          image.grayscale();

          image.getBase64(Jimp.MIME_PNG, function(err, data) {
            setAfterImage(data);
          });
        })
        .catch((err) => {
          console.log('Error? ', err);
        });
    }
  }, [imageTest, rLimit, rotate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      Image Test
      <input
        type='file'
        name='media'
        accept='image/*'
        onChange={onChange}
        className='fileSelect'
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ddf5d4',
            height: 400,
          }}
        >
          {!!imageTest && (
            <img
              alt='sample'
              src={imageTest}
              style={{ margin: 10, width: 300 }}
            />
          )}
          {!!afterImage && (
            <div style={{ width: '100%', height: '100%' }}>
              <img
                className='afterImage'
                id='afterImage'
                alt='sample2'
                src={afterImage}
                draggable='false'
              />
              <svg
                width={imageSize.width}
                height={imageSize.height}
                viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                id='draw'
                xmlns='http://www.w3.org/2000/svg'
              >
                <rect id='marquee' x='450' y='420' width='150' height='150' />
                <g id='boxes'></g>
              </svg>
            </div>
          )}
        </div>
        <div className='inputContainer'>
          <div style={{ width: 150 }}>Red Value</div>
          <Slider
            defaultValue={0}
            size='small'
            max={255}
            min={0}
            value={rLimit}
            onChange={handleInputChange}
            valueLabelDisplay='auto'
          />
          {/* <input type='number' name='rlimit' onChange={handleInputChange} /> */}
        </div>
        <div className='inputContainer'>
          <div className='button' onClick={spinRight}>
            rotate 90
          </div>
        </div>{' '}
        <div className='inputContainer'>
          <div
            className='button'
            style={{ width: 300 }}
            onClick={resetRectangles}
          >
            clear
          </div>
        </div>
      </div>
    </div>
  );
};
export default ImageTest3;
