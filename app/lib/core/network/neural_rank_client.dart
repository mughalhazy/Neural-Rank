import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:neural_rank/core/errors/api_exception.dart';

const _tokenKey = 'nr_access_token';
const _baseUrl = 'https://neural-rank-backend.onrender.com/v1';

class NeuralRankClient {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  NeuralRankClient()
      : _storage = const FlutterSecureStorage(),
        _dio = Dio(BaseOptions(
          baseUrl: _baseUrl,
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
          headers: {'Content-Type': 'application/json'},
        )) {
    _dio.interceptors.addAll([
      _BearerInterceptor(_storage),
      _RetryInterceptor(_dio),
    ]);
  }

  Future<Map<String, dynamic>> get(String path) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(path);
      return _unwrap(res.data);
    } on DioException catch (e) {
      throw _fromDio(e);
    }
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(path, data: body);
      return _unwrap(res.data);
    } on DioException catch (e) {
      throw _fromDio(e);
    }
  }

  Future<void> saveToken(String token) => _storage.write(key: _tokenKey, value: token);
  Future<void> clearToken() => _storage.delete(key: _tokenKey);
  Future<String?> readToken() => _storage.read(key: _tokenKey);

  // ── Helpers ────────────────────────────────────────────────────────────────

  static Map<String, dynamic> _unwrap(Map<String, dynamic>? data) {
    if (data == null) {
      throw const ApiException(code: 'empty_response', message: 'Empty response from server');
    }
    if (data['ok'] == false) {
      final err = data['error'] as Map<String, dynamic>? ?? {};
      throw ApiException(
        code: err['code'] as String? ?? 'unknown_error',
        message: err['message'] as String? ?? 'An error occurred',
      );
    }
    return data['data'] as Map<String, dynamic>? ?? {};
  }

  static ApiException _fromDio(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      return const ApiException(
        code: 'timeout',
        message: 'Request timed out. Please try again.',
        statusCode: 408,
      );
    }
    if (e.type == DioExceptionType.connectionError) {
      return const ApiException(
        code: 'network_error',
        message: 'No internet connection.',
        statusCode: 0,
      );
    }
    final status = e.response?.statusCode;
    final body = e.response?.data as Map<String, dynamic>?;
    final errBody = body?['error'] as Map<String, dynamic>?;
    return ApiException(
      code: errBody?['code'] as String? ?? 'http_error',
      message: errBody?['message'] as String? ?? 'HTTP error $status',
      statusCode: status,
    );
  }
}

// ── Bearer token interceptor ──────────────────────────────────────────────────

class _BearerInterceptor extends Interceptor {
  final FlutterSecureStorage _storage;
  _BearerInterceptor(this._storage);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _storage.read(key: _tokenKey);
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}

// ── Retry on 5xx (once, after 2 s) ───────────────────────────────────────────

class _RetryInterceptor extends Interceptor {
  final Dio _dio;
  _RetryInterceptor(this._dio);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final status = err.response?.statusCode ?? 0;
    final alreadyRetried = err.requestOptions.extra['_retried'] == true;
    if (status >= 500 && !alreadyRetried) {
      await Future<void>.delayed(const Duration(seconds: 2));
      try {
        final opts = err.requestOptions..extra['_retried'] = true;
        final response = await _dio.fetch<Map<String, dynamic>>(opts);
        handler.resolve(response);
        return;
      } catch (_) {
        // fall through to original error
      }
    }
    handler.next(err);
  }
}
