import Dragger from './dragger';

let holderDom = document.createElement('div');
holderDom.classList.add('holder');

new Dragger({
    classNameOfContainer: 'directory',
    classNameOfChildren: 'note',
    noteHolder: holderDom,
    callback: (result) => {
        console.log(result)
    }
});