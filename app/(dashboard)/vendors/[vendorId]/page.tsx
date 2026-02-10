"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Mail, Phone, ExternalLink, Star, Calendar, CheckCircle, XCircle, ThumbsUp } from "lucide-react";
import { Vendor, VendorReview } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

interface VendorReviewWithEvent extends VendorReview {
  event?: {
    name: string;
    event_date: string;
  };
}

function getSafeWebsiteUrl(rawUrl: unknown): string | null {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return null;
  try {
    const parsed = new URL(rawUrl, window.location.origin);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    return isHttp ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function getSafeMailtoLink(email: unknown): string | null {
  if (typeof email !== "string" || !email.trim()) return null;
  const safeEmail = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(safeEmail)) return null;
  return `mailto:${safeEmail}`;
}

function getSafeTelLink(phone: unknown): string | null {
  if (typeof phone !== "string" || !phone.trim()) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned || cleaned.length < 7) return null;
  return `tel:${cleaned}`;
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params?.vendorId as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<VendorReviewWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVendorData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch vendor details
      const vendorRes = await fetch(`/api/vendors/${vendorId}`);
      if (!vendorRes.ok) {
        throw new Error("Failed to fetch vendor details");
      }
      const vendorData = await vendorRes.json();
      setVendor(vendorData);

      // Fetch vendor reviews
      try {
        const reviewsRes = await fetch(`/api/vendors/${vendorId}/reviews`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        // Continue even if reviews fail to load
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load vendor data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  if (isLoading) return <Loading />;

  if (error) return <ErrorMessage message={error} onRetry={fetchVendorData} />;

  if (!vendor) return <ErrorMessage message="Vendor not found" />;

  const avgQualityRating = vendor.avg_quality_rating || 0;
  const onTimePercentage = vendor.on_time_percentage || 0;
  const totalEvents = vendor.total_events || 0;
  const safeMailtoLink = getSafeMailtoLink(vendor.contact_email);
  const safeTelLink = getSafeTelLink(vendor.contact_phone);
  const safeWebsiteUrl = getSafeWebsiteUrl(vendor.website);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Vendors", href: "/vendors" },
          { label: vendor.name }
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
            <p className="text-gray-500 mt-1">Vendor Details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/vendors/${vendor.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Vendor
          </Link>
        </Button>
      </div>

      {/* Vendor Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Services</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {((vendor as any).vendor_services || []).length > 0 ? (
                  (vendor as any).vendor_services.map((service: any) => (
                    <Badge key={service.event_service_id} variant="secondary">
                      {service.event_services?.name || "Service"}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">No services set</Badge>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500">Contact Person</p>
              <p className="font-medium mt-1">{vendor.contact_name || "N/A"}</p>
            </div>
            {safeMailtoLink && (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <a href={safeMailtoLink} className="hover:underline">
                    {vendor.contact_email}
                  </a>
                </div>
              </>
            )}
            {safeTelLink && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-4 w-4" />
                <a href={safeTelLink} className="hover:underline">
                  {vendor.contact_phone}
                </a>
              </div>
            )}
            {safeWebsiteUrl && (
              <>
                <Separator />
                <Button asChild variant="outline" className="w-full">
                  <a href={safeWebsiteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Based on {totalEvents} completed event{totalEvents !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600 fill-current" />
                <span className="font-medium">Reliability Score</span>
              </div>
              <span className="text-2xl font-bold text-yellow-700">
                {vendor.reliability_score ? vendor.reliability_score.toFixed(1) : "N/A"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Avg Quality</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {avgQualityRating > 0 ? avgQualityRating.toFixed(1) : "N/A"}
                  {avgQualityRating > 0 && <span className="text-sm font-normal">/5</span>}
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-600 font-medium">On-Time Rate</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {onTimePercentage > 0 ? `${Math.round(onTimePercentage)}%` : "N/A"}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600 font-medium">Starting Price</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {vendor.cost_per_unit ? formatCurrency(vendor.cost_per_unit) : "Contact for Quote"}
              </p>
              {vendor.cost_structure && (
                <p className="text-sm text-gray-500 mt-1">{vendor.cost_structure}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
          <CardDescription>
            {reviews.length === 0
              ? "No reviews yet"
              : `${reviews.length} review${reviews.length !== 1 ? 's' : ''} from completed events`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No reviews available yet.</p>
              <p className="text-sm mt-1">Reviews will appear after events are completed and vendors are reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {review.event && (
                        <>
                          <h4 className="font-semibold text-lg">{review.event.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(review.event.event_date)}
                          </div>
                        </>
                      )}
                    </div>
                    {review.quality_rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded border border-yellow-100">
                        <Star className="h-4 w-4 text-yellow-600 fill-current" />
                        <span className="font-bold text-yellow-700">{review.quality_rating}/5</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mb-3">
                    {review.on_time !== null && (
                      <div className={`flex items-center gap-1.5 text-sm ${review.on_time ? 'text-green-700' : 'text-red-700'}`}>
                        {review.on_time ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{review.on_time ? 'On Time' : 'Late'}</span>
                      </div>
                    )}
                    {review.cost_accurate !== null && (
                      <div className={`flex items-center gap-1.5 text-sm ${review.cost_accurate ? 'text-green-700' : 'text-red-700'}`}>
                        {review.cost_accurate ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{review.cost_accurate ? 'Cost Accurate' : 'Cost Inaccurate'}</span>
                      </div>
                    )}
                    {review.would_use_again !== null && (
                      <div className={`flex items-center gap-1.5 text-sm ${review.would_use_again ? 'text-green-700' : 'text-red-700'}`}>
                        <ThumbsUp className={`h-4 w-4 ${review.would_use_again ? '' : 'rotate-180'}`} />
                        <span>{review.would_use_again ? 'Would Use Again' : 'Would Not Use Again'}</span>
                      </div>
                    )}
                  </div>

                  {review.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <p className="text-sm text-gray-700">{review.notes}</p>
                    </div>
                  )}

                  {review.reviewed_at && (
                    <p className="text-xs text-gray-400 mt-3">
                      Reviewed on {formatDate(review.reviewed_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
