import { useState } from 'react';
import ReactImageAnnotate from 'react-image-annotate';

const ImageTest2 = () => {
  const [imageTest, setImageTest] = useState('');
  const onChange = (e: any) => {
    setImageTest(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div>
      {' '}
      <input
        type='file'
        name='media'
        accept='image/*'
        onChange={onChange}
        className='fileSelect'
      />
      {imageTest && (
        <ReactImageAnnotate
          labelImages
          showPointDistances
          regionClsList={['Alpha', 'Beta', 'Charlie', 'Delta']}
          regionTagList={['tag1', 'tag2', 'tag3']}
          images={[
            {
              src: imageTest,
              name: 'Image 1',
              regions: [],
            },
          ]}
          onExit={(state: any) => {
            console.log('?? ', state);
          }}
        />
      )}
    </div>
  );
};

export default ImageTest2;
