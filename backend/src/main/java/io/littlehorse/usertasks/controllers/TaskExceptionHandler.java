package io.littlehorse.usertasks.controllers;

import io.littlehorse.usertasks.exceptions.CustomUnauthorizedException;
import io.littlehorse.usertasks.exceptions.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = {UserController.class, AdminController.class})
public class TaskExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    ProblemDetail notFound(NotFoundException error) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, error.getMessage());
    }

    @ExceptionHandler(CustomUnauthorizedException.class)
    ProblemDetail forbidden(CustomUnauthorizedException error) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, error.getMessage());
    }
}
