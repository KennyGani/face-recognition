import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
    selector: 'app-take-photo-and-training',
    templateUrl: './take-photo-and-training.component.html',
    styleUrls: ['./take-photo-and-training.component.css'],
})
export class TakePhotoAndTrainingComponent implements AfterViewInit, OnInit {
    constructor(private httpClient: HttpClient) {}

    public WIDTH = 540;
    public HEIGHT = 720;
    public name!: string;
    public progressPercentage: number | string = 0;

    @ViewChild('video')
    public video!: ElementRef;

    @ViewChild('canvas')
    public canvas!: ElementRef;

    @ViewChild('nameInput') nameInput!: ElementRef;
    @ViewChild('totalPhoto') totalPhoto!: ElementRef;

    private captureImages: string[] = [];
    public error: any;

    async ngOnInit() {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri('../../assets/models'),
            await faceapi.nets.faceLandmark68Net.loadFromUri(
                '../../assets/models'
            ),
            await faceapi.nets.faceRecognitionNet.loadFromUri(
                '../../assets/models'
            ),
        ]);
    }

    public async ngAfterViewInit() {
        await this.setCamera();
    }

    public async setCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 540, height: 720 },
                });
                if (stream) {
                    this.video.nativeElement.srcObject = stream;
                    this.video.nativeElement.play();
                    this.error = null;
                } else {
                    this.error = 'You have no output video device';
                }
            } catch (e) {
                this.error = e;
            }
        }
    }

    public captureImage() {
        this.progressPercentage = 0;
        let x = this.totalPhoto.nativeElement.value;

        const forLoopBody = (iteration: number, delay: number): void => {
            setTimeout((): void => {
                this.drawImageToCanvas(this.video.nativeElement);
                this.captureImages.push(
                    this.canvas.nativeElement.toDataURL('image/png')
                );
                this.progressPercentage = (iteration * 100) / x;
            }, delay * iteration);
        };

        for (let i = 1; i <= x; i++) {
            forLoopBody(i, 20);
        }
    }

    public async downloadJson() {
        let oldData: any = [];

        await this.httpClient
            .get('../../assets/face-model/data.json')
            .forEach((data) => {
                oldData.push(data);
            });

        let newData: Object[] = [];

        oldData[0].forEach((element: any) => {
            newData.push(element);
        });

        const labels = [this.nameInput.nativeElement.value];

        return Promise.all(
            labels.map(async (label) => {
                const descriptions = [];

                let x = this.totalPhoto.nativeElement.value;
                for (let i = 0; i < x; i++) {
                    let image = this.captureImages[i];

                    let img = await faceapi.fetchImage(image);
                    let detections: any = await faceapi
                        .detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    console.log(label + i + JSON.stringify(detections));

                    if (JSON.stringify(detections) === undefined) {
                        continue;
                    } else {
                        descriptions.push(detections.descriptor);
                        this.progressPercentage = Number((i * 100) / x).toFixed(
                            2
                        );
                    }

                    setTimeout(() => 10);
                }

                newData.push(
                    new faceapi.LabeledFaceDescriptors(label, descriptions)
                );

                this.postJson(newData);

                // let data =
                //     'data:text/json;charset=utf-8,' +
                //     encodeURIComponent(JSON.stringify(newData));

                // let downloader = document.createElement('a');
                // downloader.setAttribute('href', data);
                // downloader.setAttribute('download', 'data.json');
                // downloader.click();

                this.captureImages = [];

                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        );
    }

    public async captureImageTrainAndDownload() {
        let oldData: any = [];
        this.progressPercentage = 0;

        await this.httpClient
            .get('../../assets/face-model/data.json')
            .forEach((data) => {
                oldData.push(data);
            });

        let newData: Object[] = [];

        oldData[0].forEach((element: any) => {
            newData.push(element);
        });

        const labels = [this.nameInput.nativeElement.value];

        return Promise.all(
            labels.map(async (label) => {
                const descriptions = [];

                let x = 200;
                for (let i = 0; i <= x; i++) {
                    this.drawImageToCanvas(this.video.nativeElement);
                    this.captureImages.push(
                        this.canvas.nativeElement.toDataURL('image/png')
                    );
                    let image = this.captureImages[i];

                    const img = await faceapi.fetchImage(image);
                    const detections: any = await faceapi
                        .detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    console.log(label + i + JSON.stringify(detections));

                    if (JSON.stringify(detections) === undefined) {
                        x++;
                        continue;
                    } else {
                        descriptions.push(detections.descriptor);
                        this.progressPercentage = Number((i * 100) / x).toFixed(
                            2
                        );
                    }

                    setTimeout(() => 10);
                }

                newData.push(
                    new faceapi.LabeledFaceDescriptors(label, descriptions)
                );

                let data =
                    'data:text/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify(newData));

                let downloader = document.createElement('a');
                downloader.setAttribute('href', data);
                downloader.setAttribute('download', 'data.json');
                downloader.click();

                this.captureImages = [];

                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        );
    }

    private drawImageToCanvas(image: any) {
        this.canvas.nativeElement
            .getContext('2d')
            .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
    }

    public postJson(data: unknown) {
        let header = new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
        });

        void this.httpClient
            .post('http://localhost:4200/api', data, {
                headers: header,
            })
            .toPromise();
    }
}
