import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
    selector: 'app-face-recognize',
    templateUrl: './face-recognize.component.html',
    styleUrls: ['./face-recognize.component.css'],
})
export class FaceRecognizeComponent implements OnInit {
    constructor(private elRef: ElementRef, private httpClient: HttpClient) {}

    public videoWidth = 540;
    public videoHeight = 720;

    @ViewChild('video', { static: true })
    public video!: ElementRef;
    @ViewChild('canvas', { static: true })
    public canvasRef!: ElementRef;

    @ViewChild('distanceThreshold') distanceThreshold!: ElementRef;

    public recognizedName!: string;

    public detection: any;
    public resizedDetections: any;
    public canvas: any;
    public canvasEl: any;
    public displaySize: any;
    public videoInput: any;

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

        this.startVideo();
    }

    private startVideo(): void {
        if (!this.video) {
            throw 0;
        }
        this.videoInput = this.video.nativeElement;

        const constraints = {
            audio: false,
            video: { width: 540, height: 720 },
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((mediaStream) => {
                const video = this.elRef.nativeElement.querySelector('video');
                video.srcObject = mediaStream;
                video.onloadedmetadata = () => {
                    video.play();
                };
            })
            .catch((err) => {
                console.error(`${err.name}: ${err.message}`);
            });

        this.detect_Faces();
    }

    private async detect_Faces() {
        const LabeledFaceDescriptors = await this.loadLocalFaceDataJson();

        this.elRef.nativeElement
            .querySelector('video')
            .addEventListener('play', async () => {
                if (!this.canvasRef) {
                    throw 0;
                }
                this.canvas = faceapi.createCanvasFromMedia(this.videoInput);
                this.canvasEl = this.canvasRef.nativeElement;
                this.canvasEl.appendChild(this.canvas);
                this.canvas.setAttribute('id', 'canvass');
                this.canvas.setAttribute(
                    'style',
                    `position: fixed;
                    top: 0;
                    left: 0;`
                );
                this.displaySize = {
                    width: this.videoInput.width,
                    height: this.videoInput.height,
                };
                faceapi.matchDimensions(this.canvas, this.displaySize);
                setInterval(async () => {
                    this.detection = await faceapi
                        .detectAllFaces(
                            this.videoInput,
                            new faceapi.SsdMobilenetv1Options()
                        )
                        .withFaceLandmarks()
                        .withFaceDescriptors();
                    this.resizedDetections = faceapi.resizeResults(
                        this.detection,
                        this.displaySize
                    );
                    this.canvas
                        .getContext('2d', { willReadFrequently: true })
                        .clearRect(0, 0, this.canvas.width, this.canvas.height);

                    const faceMatcher = new faceapi.FaceMatcher(
                        LabeledFaceDescriptors,
                        1 - this.distanceThreshold.nativeElement.value / 100
                    );

                    const results = this.resizedDetections.map((d: any) => {
                        return faceMatcher.findBestMatch(d.descriptor);
                    });

                    results.forEach((result: any, i: number) => {
                        const box = this.resizedDetections[i].detection.box;
                        result._distance = 100 - result._distance * 100;
                        const drawBox = new faceapi.draw.DrawBox(box, {
                            label: result.toString(),
                        });
                        this.recognizedName = result.toString();

                        drawBox.draw(this.canvas);
                    });
                }, 100);
            });
    }

    private async loadLocalFaceDataJson() {
        let faceData: Object[] = [];

        await this.httpClient
            .get('../../assets/face-model/data.json')
            .forEach((data) => faceData.push(data));

        const loadedFaceData: faceapi.LabeledFaceDescriptors[] = [];

        Object.entries(faceData[0]).forEach((datas: any) => {
            const jsonData: any[] = [];
            datas[1]['descriptors'].forEach((datum: Iterable<number>) => {
                datum = new Float32Array(datum);
                jsonData.push(datum);
            });
            loadedFaceData.push(
                new faceapi.LabeledFaceDescriptors(datas[1]['label'], jsonData)
            );
            document.body.append(datas[1]['label'] + ' Faces Loaded | ');
        });

        return loadedFaceData;
    }
}
