import React, { FC } from 'react';

import './Card.scss';

interface ICardProps {
    cardInfo: {id: number, name: string, points: number, fee: number};
}

export const Card: FC<ICardProps> = ({
    cardInfo,
}) => {
    return (
        <div>
            <section ng-repeat="card in cards" 
                 className="card theme-{{card.themeColor}}"
                 data-color="{{card.themeColorHex}}">
                <div className="card__map">
                    <div className="card__map__inner"></div>
                </div>
                <section className="card__part card__part-1">
                    <div className="card__part__inner">
                        <header className="card__header">
                            <div className="card__header__close-btn"></div>
                            <span className="card__header__id"># {cardInfo.id}</span>
                            <span className="card__header__price">{cardInfo.fee}</span>
                        </header>
                        <div className="card__stats" ng-style="{'background-image': 'url({{card.bgImgUrl}})'}">
                            <div className="card__stats__item card__stats__item--req">
                                <p className="card__stats__type">Requests</p>
                                <span className="card__stats__value">{cardInfo.points}</span>
                            </div>
                            <div className="card__stats__item card__stats__item--pledge">
                                <p className="card__stats__type">Pledge</p>
                                <span className="card__stats__value">${cardInfo.name}</span>
                            </div>
                            <div className="card__stats__item card__stats__item--weight">
                                <p className="card__stats__type">Weight</p>
                                <span className="card__stats__value">{cardInfo.name}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    );
};