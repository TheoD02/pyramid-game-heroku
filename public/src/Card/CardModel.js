import {Component} from 'react';
import './card.css';
import CARREAUROUGE from './img/carreau-rouge.svg';
import COEURNOIR from './img/coeur-noir.svg';
import COEURROUGE from './img/coeur-rouge.svg';
import DAMENOIR from './img/dame-noir.svg';
import DAMEROUGE from './img/dame-rouge.svg';
import PIQUENOIR from './img/pique-noir.svg';
import PIQUEROUGE from './img/pique-rouge.svg';
import ROINOIR from './img/roi-noir.svg';
import ROIROUGE from './img/roi-rouge.svg';
import TREFLENOIR from './img/trefle-noir.svg';
import TREFLEROUGE from './img/trefle-rouge.svg';
import VALETNOIR from './img/valet-noir.svg';
import VALETROUGE from './img/valet-rouge.svg';
import PICOLENATIONAL from './img/picole-nationale.jpg';
import {url} from 'socket.io-client/build/url';
import socket from '../Socket';
import Swal from 'sweetalert2';

class CardModel extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            isBackFace: this.props.isBackFace,
            bouncing  : false,
        };
    }

    lettersHandler = (letters) =>
    {
        switch (letters) {
            case 'J':
                return 'valet';
            case 'Q':
                return 'dame';
            case 'K':
                return 'roi';
            case null:
                return null;
            default:
                throw new Error('Ce type de carte n\'existe pas. ' + letters);
        }
    };

    imageHandler = (imageToSearch) =>
    {
        let image = null;
        switch (imageToSearch) {
            case 'carreau-rouge.svg':
                image = CARREAUROUGE;
                break;
            case 'coeur-noir.svg':
                image = COEURNOIR;
                break;
            case 'coeur-rouge.svg':
                image = COEURROUGE;
                break;
            case 'dame-noir.svg':
                image = DAMENOIR;
                break;
            case 'dame-rouge.svg':
                image = DAMEROUGE;
                break;
            case 'pique-noir.svg':
                image = PIQUENOIR;
                break;
            case 'pique-rouge.svg':
                image = PIQUEROUGE;
                break;
            case 'roi-noir.svg':
                image = ROINOIR;
                break;
            case 'roi-rouge.svg':
                image = ROIROUGE;
                break;
            case 'trefle-noir.svg':
                image = TREFLENOIR;
                break;
            case 'trefle-rouge.svg':
                image = TREFLEROUGE;
                break;
            case 'valet-noir.svg':
                image = VALETNOIR;
                break;
            case 'valet-rouge.svg':
                image = VALETROUGE;
                break;
            default:
                image = 'TOZ';
        }
        return image;
    };


    handleClickOnCard = (e) =>
    {
        if (this.props.canFlipCard) {
            socket.emit('flipCard', this.props.cardid, this.props.ranknumber, this.props.cardnumber);
        }
    };

    componentDidMount()
    {
        socket.on('onCardFlip', (cardID, cardRank) =>
        {
            if (this.props.cardid === cardID && this.props.ranknumber === cardRank) {
                this.setState({isBackFace: false, bouncing: false});
            }
        });
        socket.on('onCardCannotFlip', cardNumber =>
        {
            if (this.props.cardnumber === cardNumber) {
                this.setState({bouncing: true});
            }
        });
        if (this.props.canSeeCard === false) {
            let timeInSecond = 60;
            let timerInterval;
            Swal.fire({
                title           : 'Attention!',
                toast           : true,
                position        : 'top',
                icon            : 'warning',
                html            : 'Il vous reste <b></b> pour retenir vos cartes.',
                timer           : 60000,
                timerProgressBar: true,
                didOpen         : () =>
                {
                    Swal.showLoading();
                    timerInterval = setInterval(() =>
                    {
                        const content = Swal.getHtmlContainer();
                        if (content) {
                            const b = content.querySelector('b');
                            if (b) {
                                b.textContent = (Swal.getTimerLeft() / 1000).toFixed(1);
                            }
                        }
                    }, 100);
                },
                willClose       : () =>
                {
                    clearInterval(timerInterval);
                },
            }).then((result) =>
            {
                /* Read more about handling dismissals below */
                if (result.dismiss === Swal.DismissReason.timer) {
                    console.log('I was closed by the timer');
                }
            });
            setTimeout(() =>
            {
                this.setState({isBackFace: true});
            }, timeInSecond * 1000);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot)
    {
        if (this.state.bouncing === true) {
            setTimeout(() =>
            {
                this.setState({bouncing: false});
            }, 10000);
        }
    }


    render()
    {
        const letters = this.props.letters;
        let image = null;
        if (letters !== null) {
            const iconType = this.lettersHandler(letters);
            image = this.imageHandler(`${iconType}-${this.props.color}.svg`);
        }
        else {
            image = this.imageHandler(`${this.props.iconType}-${this.props.color}.svg`);
        }
        const classOfParent = (this.state.isBackFace ? 'card flipped' : 'card') + (this.state.bouncing ? ' heartbeat' : '');
        console.log(classOfParent);
        return (
            <div className={classOfParent}
                 onClick={this.handleClickOnCard}>
                <div className={'back face'} style={{backgroundImage: `url(${PICOLENATIONAL})`}}/>
                <div className={'front face'}>
                    <p className={'top-left-number'}>{this.props.number ?? this.props.letters}</p>
                    <p className={'top-right-number'}>{this.props.number ?? this.props.letters}</p>
                    <p className={'bottom-left-number'}>{this.props.number ?? this.props.letters}</p>
                    <p className={'bottom-right-number'}>{this.props.number ?? this.props.letters}</p>
                    <div className={`card-icons-container card-icons-container-${this.props.number ?? this.props.letters}`}>
                        {this.props.number !== null ? [...Array(this.props.number)].map((x, i) =>
                            <div key={i} className="card-icon-container">
                                <div className="card-icon"
                                     style={{
                                         background      : `url(${image})`,
                                         height          : '30px',
                                         width           : '30px',
                                         backgroundSize  : 'cover',
                                         backgroundRepeat: 'no-repeat',
                                     }}>
                                </div>
                            </div>,
                        ) : ''}
                        {this.props.letters !== null ?
                            <div className={'card-img-icon'}>
                                <img src={image} alt={this.props.iconType}/>
                            </div>
                            : ''}
                    </div>
                </div>
            </div>
        );
    }
}

export default CardModel;