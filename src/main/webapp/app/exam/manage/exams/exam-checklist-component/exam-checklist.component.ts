import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Exam } from 'app/entities/exam.model';
import { ExamChecklist } from 'app/entities/exam-checklist.model';
import { faChartBar, faEye, faListAlt, faThList, faUser, faWrench } from '@fortawesome/free-solid-svg-icons';
import { ExamChecklistService } from 'app/exam/manage/exams/exam-checklist-component/exam-checklist.service';
import { JhiWebsocketService } from 'app/core/websocket/websocket.service';
import { QuizPoolService } from 'app/exercises/quiz/manage/quiz-pool.service';
import { QuizPool } from 'app/entities/quiz/quiz-pool.model';
import { onError } from 'app/shared/util/global.utils';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AlertService } from 'app/core/util/alert.service';

@Component({
    selector: 'jhi-exam-checklist',
    templateUrl: './exam-checklist.component.html',
})
export class ExamChecklistComponent implements OnChanges, OnInit, OnDestroy {
    @Input() exam: Exam;
    @Input() getExamRoutesByIdentifier: any;

    quizPool: QuizPool;
    examChecklist: ExamChecklist;
    isLoading = false;
    pointsExercisesEqual = false;
    allExamsGenerated = false;
    allGroupsContainExercise = false;
    totalPoints = false;
    hasOptionalExercises = false;
    countMandatoryExercises = 0;
    isTestExam: boolean;

    numberOfSubmitted = 0;
    numberOfStarted = 0;

    examPreparationFinished: boolean;

    // Icons
    faEye = faEye;
    faWrench = faWrench;
    faUser = faUser;
    faListAlt = faListAlt;
    faThList = faThList;
    faChartBar = faChartBar;

    constructor(
        private examChecklistService: ExamChecklistService,
        private websocketService: JhiWebsocketService,
        private alertService: AlertService,
        private quizPoolService: QuizPoolService,
    ) {}

    ngOnInit() {
        const submittedTopic = this.examChecklistService.getSubmittedTopic(this.exam);
        this.websocketService.subscribe(submittedTopic);
        this.websocketService.receive(submittedTopic).subscribe(() => (this.numberOfSubmitted += 1));
        const startedTopic = this.examChecklistService.getStartedTopic(this.exam);
        this.websocketService.subscribe(startedTopic);
        this.websocketService.receive(startedTopic).subscribe(() => (this.numberOfStarted += 1));
        if (this.exam && this.exam.course) {
            this.quizPoolService.find(this.exam.course.id!, this.exam.id!).subscribe({
                next: (response: HttpResponse<QuizPool>) => {
                    this.quizPool = response.body!;
                },
                error: (error: HttpErrorResponse) => {
                    if (error.status === 404) {
                        this.quizPool = new QuizPool();
                        this.quizPool.quizGroups = [];
                        this.quizPool.quizQuestions = [];
                    } else {
                        onError(this.alertService, error);
                    }
                },
            });
        }
    }

    ngOnChanges() {
        this.isTestExam = this.exam.testExam!;
        this.pointsExercisesEqual = this.examChecklistService.checkPointsExercisesEqual(this.exam);
        this.totalPoints = this.examChecklistService.checkTotalPointsMandatory(this.pointsExercisesEqual, this.exam);
        this.allGroupsContainExercise = this.examChecklistService.checkEachGroupContainsExercise(this.exam);
        this.countMandatoryExercises = this.exam.exerciseGroups?.filter((group) => group.isMandatory)?.length ?? 0;
        this.hasOptionalExercises = this.countMandatoryExercises < (this.exam.exerciseGroups?.length ?? 0);
        this.examChecklistService.getExamStatistics(this.exam).subscribe((examStats) => {
            this.examChecklist = examStats;
            this.allExamsGenerated =
                !!this.exam.numberOfExamUsers && this.exam.numberOfExamUsers > 0 && this.examChecklistService.checkAllExamsGenerated(this.exam, this.examChecklist);
            this.numberOfStarted = this.examChecklist.numberOfExamsStarted;
            this.numberOfSubmitted = this.examChecklist.numberOfExamsSubmitted;
        });
    }

    ngOnDestroy(): void {
        const submittedTopic = this.examChecklistService.getSubmittedTopic(this.exam);
        this.websocketService.unsubscribe(submittedTopic);
        const startedTopic = this.examChecklistService.getStartedTopic(this.exam);
        this.websocketService.unsubscribe(startedTopic);
    }
}
