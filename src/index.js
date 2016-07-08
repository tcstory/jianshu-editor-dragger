import Dragger from './dragger';

let holderDom = document.createElement('div');
holderDom.classList.add('holder');

let dragger = new Dragger({
    classNameOfContainer: 'directory',
    classNameOfChildren: 'note',
    noteHolder: holderDom,
    callback: (result) => {
        console.log(result)
    }
});

// 测试一下,在拖拽文章的过程中,更新文章数量会不会引起状态的混乱
setTimeout(() => {
    console.log('更新文章');
    let container = document.querySelector('.directory');
    for (let i = 10; i < 15; i++) {
        let div = document.createElement('div');
        div.className = 'note';
        div.innerHTML = `新建文章${i}`;
        container.appendChild(div);
    }
    dragger.update();
}, 5000);

