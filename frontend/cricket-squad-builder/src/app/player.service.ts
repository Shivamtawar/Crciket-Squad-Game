import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiPlayer, ApiService } from './api.service';

export interface Player {
  id: number;
  description: string;
  cardName: string;
  score: number;
  rarity: string;
  imageUrl: string;
    fallbackImageUrl: string;
  cardCost: number;
  role: "BAT" | "BWL" | "AR" | "WK";
}

@Injectable({ providedIn: "root" })
export class PlayerService {
    private selectedSquadSubject = new BehaviorSubject<Player[]>([]);
    private playersSubject = new BehaviorSubject<Player[]>(this.getFallbackPlayers());
    private fallbackImageUrl = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80';

    selectedSquad$ = this.selectedSquadSubject.asObservable();
    players$ = this.playersSubject.asObservable();

    constructor(private api: ApiService) {}

    loadPlayers(): Observable<Player[]> {
        return this.api.getPlayers().pipe(
            map((response) => response.players.map((player) => this.mapApiPlayer(player))),
            tap((players) => this.playersSubject.next(players)),
            catchError(() => {
                const fallback = this.getFallbackPlayers();
                this.playersSubject.next(fallback);
                return of(fallback);
            })
        );
    }

    getPlayers(): Player[] {
        return this.playersSubject.value;
    }

    getPlayersSnapshot(): Player[] {
        return this.playersSubject.value;
    }

    getPlayersFallback(): Player[] {
        return this.getFallbackPlayers();
    }

    private getFallbackPlayers(): Player[] {
        const players: Omit<Player, 'fallbackImageUrl'>[] = [
    {
        "description": "PC",
        "cardName": "Pat Cummins",
        "score": 249,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661814/cricket-cards/fptcmbpjlbwpvte4hpna.png",
        "cardCost": 10,
        "id": 1,
        "role": "WK"
    },
    {
        "description": "SR",
        "cardName": "Steve Smith",
        "score": 246,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661261/cricket-cards/xdsnxj9e0qo3kwoswjo1.png",
        "cardCost": 10,
        "id": 2,
        "role": "WK"
    },
    {
        "description": "ML",
        "cardName": "Marnus Labuschagne",
        "score": 245,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661945/cricket-cards/dziqgvfw6rrrad09surr.png",
        "cardCost": 10,
        "id": 3,
        "role": "AR"
    },
    {
        "description": "MS",
        "cardName": "MS Dhoni",
        "score": 244,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659575/cricket-cards/fzmz3dmg0nf9ycqgwuec.png",
        "cardCost": 9.5,
        "id": 4,
        "role": "BAT"
    },
    {
        "description": "TH",
        "cardName": "Travis Head",
        "score": 244,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753662002/cricket-cards/yx2pdixuqedyltoihljj.png",
        "cardCost": 9.5,
        "id": 5,
        "role": "WK"
    },
    {
        "description": "SKY",
        "cardName": "Suryakumar Yadav",
        "score": 242,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659981/cricket-cards/cq7qzrtys7hubp4uxfuq.png",
        "cardCost": 9.5,
        "id": 6,
        "role": "BAT"
    },
    {
        "description": "SD",
        "cardName": "Shikhar Dhawan",
        "score": 241,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661211/cricket-cards/hl9hqezxbqh5momwoth0.png",
        "cardCost": 9.5,
        "id": 7,
        "role": "AR"
    },
    {
        "description": "DW",
        "cardName": "David Warner",
        "score": 239,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661862/cricket-cards/dwhka0qmem1t8uss2m6e.png",
        "cardCost": 9,
        "id": 8,
        "role": "BAT"
    },
    {
        "description": "YJ",
        "cardName": "Yashasvi Jaiswal",
        "score": 238,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660324/cricket-cards/vz6tvqkfkcu23jhzdoqx.png",
        "cardCost": 9,
        "id": 9,
        "role": "BAT"
    },
    {
        "description": "UK",
        "cardName": "Umesh Yadav",
        "score": 236,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753718299/cricket-cards/ujgimz3qxb48gbwdnk3q.png",
        "cardCost": 9,
        "id": 10,
        "role": "WK"
    },
    {
        "description": "HP",
        "cardName": "Hardik Pandya",
        "score": 235,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660029/cricket-cards/vjmtcrgwdh1mfmdizqrm.png",
        "cardCost": 9,
        "id": 11,
        "role": "BWL"
    },
    {
        "description": "SS",
        "cardName": "Mohammed Shami",
        "score": 235,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660514/cricket-cards/bjlxuqv1n4dplxdmweqn.png",
        "cardCost": 9,
        "id": 12,
        "role": "AR"
    },
    {
        "description": "SG",
        "cardName": "Shubman Gill",
        "score": 235,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659485/cricket-cards/y8mzxozsoxtub40rbtq0.png",
        "cardCost": 9,
        "id": 13,
        "role": "BAT"
    },
    {
        "description": "AS",
        "cardName": "Arshdeep Singh",
        "score": 235,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660568/cricket-cards/s3jpmeevlx5zvc57lfyl.png",
        "cardCost": 9,
        "id": 14,
        "role": "AR"
    },
    {
        "description": "RG",
        "cardName": "Ruturaj Gaikwad",
        "score": 233,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660715/cricket-cards/vlfv2oeohdmuvqhbqt4a.png",
        "cardCost": 8.5,
        "id": 15,
        "role": "WK"
    },
    {
        "description": "IK",
        "cardName": "Ishan Kishan",
        "score": 232,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660271/cricket-cards/no4n6adsil99eag2r5lq.png",
        "cardCost": 8.5,
        "id": 16,
        "role": "BAT"
    },
    {
        "description": "KL",
        "cardName": "KL Rahul",
        "score": 230,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659813/cricket-cards/uxkfpcin8nyhxdkiu58p.png",
        "cardCost": 8.5,
        "id": 17,
        "role": "BAT"
    },
    {
        "description": "BK",
        "cardName": "Bhuvneshwar Kumar",
        "score": 229,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661146/cricket-cards/cndr1udj96iwwuvawsu7.png",
        "cardCost": 8.5,
        "id": 18,
        "role": "BWL"
    },
    {
        "description": "VK",
        "cardName": "Virat Kohli",
        "score": 250,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659285/cricket-cards/zblgxtmyq3glfgza54g8.png",
        "cardCost": 10,
        "id": 19,
        "role": "WK"
    },
    {
        "description": "RS",
        "cardName": "Rohit Sharma",
        "score": 250,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659215/cricket-cards/f4osev3lnlkfm2sqsy8a.png",
        "cardCost": 10,
        "id": 20,
        "role": "BAT"
    },
    {
        "description": "JB",
        "cardName": "Jasprit Bumrah",
        "score": 250,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659356/cricket-cards/fhhieriwpa0wvsgcolum.png",
        "cardCost": 10,
        "id": 21,
        "role": "AR"
    },
    {
        "description": "WS",
        "cardName": "Washington Sundar",
        "score": 225,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660157/cricket-cards/tnpkjgceksavfeysjkhy.png",
        "cardCost": 8,
        "id": 22,
        "role": "BWL"
    },
    {
        "description": "DH",
        "cardName": "Deepak Hooda",
        "score": 225,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660458/cricket-cards/lo4vyw2e7kbuqjrwbmze.png",
        "cardCost": 8,
        "id": 23,
        "role": "BAT"
    },
    {
        "description": "AP",
        "cardName": "Axar Patel",
        "score": 225,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659694/cricket-cards/osizqls9pum8xotqgmu5.png",
        "cardCost": 8,
        "id": 24,
        "role": "AR"
    },
    {
        "description": "SI",
        "cardName": "Shreyas Iyer",
        "score": 225,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659916/cricket-cards/kjtd1gzoxjkfv23ugkok.png",
        "cardCost": 8,
        "id": 25,
        "role": "BAT"
    },
    {
        "description": "RJ",
        "cardName": "Ravindra Jadeja",
        "score": 240,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659433/cricket-cards/cbxw2nbh2blmfioxe4hh.png",
        "cardCost": 9.5,
        "id": 26,
        "role": "WK"
    },
    {
        "description": "YC",
        "cardName": "Yuzvendra Chahal",
        "score": 222,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660097/cricket-cards/miu8pfm2yotu5ppgm9km.png",
        "cardCost": 8,
        "id": 27,
        "role": "BAT"
    },
    {
        "description": "UY",
        "cardName": "Umesh Yadav",
        "score": 219,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660409/cricket-cards/vb7t5pmybsg3zlizvelx.png",
        "cardCost": 7.5,
        "id": 28,
        "role": "WK"
    },
    {
        "description": "KY",
        "cardName": "Kuldeep Yadav",
        "score": 214,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660618/cricket-cards/w6tnfgnmodcq9qgxrowy.png",
        "cardCost": 7.5,
        "id": 29,
        "role": "BWL"
    },
    {
        "description": "TV",
        "cardName": "Tilak Varma",
        "score": 213,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660848/cricket-cards/znvfoqntz2f2uxbfxp8l.png",
        "cardCost": 7.5,
        "id": 30,
        "role": "WK"
    },
    {
        "description": "ST",
        "cardName": "Shardul Thakur",
        "score": 211,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660207/cricket-cards/ckzvf3epsxpjl5dfkbwo.png",
        "cardCost": 7.5,
        "id": 31,
        "role": "AR"
    },
    {
        "description": "RP",
        "cardName": "Rishabh Pant",
        "score": 201,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661099/cricket-cards/svunyaqvfvyhh54pwn2t.png",
        "cardCost": 7,
        "id": 32,
        "role": "BAT"
    },
    {
        "description": "SS",
        "cardName": "Sanju Samson",
        "score": 199,
        "rarity": "common",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661902/cricket-cards/xnj0wejfryphpfgywif5.png",
        "cardCost": 7,
        "id": 33,
        "role": "BAT"
    },
    {
        "description": "PS",
        "cardName": "Prabhsimran Singh",
        "score": 195,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660669/cricket-cards/flnudnhawvxwhevpevra.png",
        "cardCost": 6.5,
        "id": 34,
        "role": "BWL"
    },
    {
        "description": "RT",
        "cardName": "Rahul Tewatia",
        "score": 187,
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753661017/cricket-cards/q6dqts5qufrppsqjitrj.png",
        "cardCost": 6.5,
        "id": 35,
        "role": "BWL"
    },
    {
        "description": "MK",
        "cardName": "Musheer Khan",
        "score": 177,
        "rarity": "common",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660821/cricket-cards/aansuvsekuxlntbslkp7.png",
        "cardCost": 6,
        "id": 36,
        "role": "BAT"
    },
    {
        "description": "UY",
        "cardName": "Umesh Yadav (C)",
        "score": 179,
        "rarity": "common",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660429/cricket-cards/yhigrywlrge0qgixcits.png",
        "cardCost": 6,
        "id": 37,
        "role": "WK"
    },
    {
        "description": "YC",
        "cardName": "Yuzvendra Chahal (C)",
        "score": 182,
        "rarity": "common",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753660075/cricket-cards/aiojwz9z3tlfpbvw4fyn.png",
        "cardCost": 6,
        "id": 38,
        "role": "BAT"
    },
    {
        "description": "SI",
        "cardName": "Shreyas Iyer (C)",
        "score": 186,
        "rarity": "common",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659924/cricket-cards/co4wjuz8lhz0krb8owmj.png",
        "cardCost": 6,
        "id": 39,
        "role": "BAT"
    },
    {
        "description": "SG",
        "cardName": "Shubman Gill (C)",
        "score": 190,
        "rarity": "common",
        "imageUrl": "https://res.cloudinary.com/dyfozi2kf/image/upload/v1753659539/cricket-cards/kygecniiqeevhiy8uwrh.png",
        "cardCost": 6.5,
        "id": 40,
        "role": "BAT"
    }
        ];

        return players.map((player) => ({
            ...player,
            fallbackImageUrl: this.fallbackImageUrl,
        }));
    }

    private mapApiPlayer(player: ApiPlayer): Player {
        return {
            id: Number(player.id),
            description: player.description ?? '',
            cardName: player.cardName ?? 'Unknown',
            score: player.score ?? this.estimateScore(player),
            rarity: player.rarity ?? 'common',
            imageUrl: player.imageUrl ?? this.fallbackImageUrl,
            fallbackImageUrl: this.fallbackImageUrl,
            cardCost: player.cardCost ?? 0,
            role: player.role ?? 'BAT',
        };
    }

    private estimateScore(player: ApiPlayer) {
        const power = player.baseStats?.power ?? 70;
        const defense = player.baseStats?.defense ?? 70;
        return Math.round((power + defense) * (player.formFactor ?? 1));
    }

    getPlayerById(id: number): Player | undefined {
        return this.getPlayers().find((player) => player.id === id);
    }

    setSelectedSquad(squad: Player[]) {
        this.selectedSquadSubject.next([...squad]);
    }

    getSelectedSquad(): Player[] {
        return this.selectedSquadSubject.value;
    }
}
