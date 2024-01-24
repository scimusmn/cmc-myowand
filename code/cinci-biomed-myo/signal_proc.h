#pragma once
#include <stdlib.h>
#include <math.h>
#include <float.h>

#include <stdlib.h>

template<typename T, size_t LEN>
class CircleBuf{
	public:
	CircleBuffer() { 
		i = 0;
		memset(buf, 0, sizeof(buf));
	}
	void push(T value) {
		buf[i] = value;
		i = (i+1) % LEN;
	}
	T * start() { return buf;}
	T * end() {
		return buf + LEN;
	}

	private:
	size_t i;
	T buf[LEN];
};


template<size_t LEN>
class Rolling {
	public:
	Rolling() {}
	void push(double value) { buf.push(value); }
	virtual double value() = 0;
	CircleBuf<double, LEN> buf;
};


template<size_t LEN>
class RollingMax : public Rolling<LEN> {
	public:
	double value() {
		double result = DBL_MIN;
		for (double *x = this->buf.start(); x != this->buf.end(); x++) {
			result = max(result, *x);
		}
		return result;
	}
};


template<size_t LEN>
class RollingMin: public Rolling<LEN> {
	public:
	double value() {
		double result = DBL_MAX;
		for (double *x = this->buf.start(); x != this->buf.end(); x++) {
			result = min(result, *x);
		}
		return result;
	}
};


template<size_t LEN>
class RollingAvg: public Rolling<LEN> {
	public:
	double value() {
		double total = 0;
		for (double *x = this->buf.start(); x != this->buf.end(); x++) {
			total += *x;
		}
		return (total/LEN);
	}
};
